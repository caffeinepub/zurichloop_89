import Array "mo:core/Array";
import Blob "mo:core/Blob";
import Runtime "mo:core/Runtime";

module {
  // IC management canister HTTP types (inlined to avoid system-idl dependency)
  public type HttpRequestResult = {
    status : Nat;
    headers : [{ name : Text; value : Text }];
    body : Blob;
  };

  public type HttpRequestArgs = {
    url : Text;
    max_response_bytes : ?Nat64;
    method : { #get; #head; #post };
    headers : [{ name : Text; value : Text }];
    body : ?Blob;
    transform : ?{
      function : shared query { response : HttpRequestResult; context : Blob } -> async HttpRequestResult;
      context : Blob;
    };
    is_replicated : ?Bool;
  };

  let ic = actor "aaaaa-aa" : actor {
    http_request : HttpRequestArgs -> async HttpRequestResult;
  };

  public type TransformationInput = {
    context : Blob;
    response : HttpRequestResult;
  };
  public type TransformationOutput = HttpRequestResult;
  public type Transform = query TransformationInput -> async TransformationOutput;
  public type Header = {
    name : Text;
    value : Text;
  };

  public func transform(input : TransformationInput) : TransformationOutput {
    let response = input.response;
    {
      response with headers = [];
    };
  };

  let httpRequestCycles = 231_000_000_000;

  public func httpGetRequest(url : Text, extraHeaders : [Header], transform : Transform) : async Text {
    let n = extraHeaders.size();
    let headers = Array.tabulate(
      n + 1,
      func(i) {
        if (i < n) { extraHeaders[i] } else {
          { name = "User-Agent"; value = "caffeine.ai" };
        };
      },
    );
    let request : HttpRequestArgs = {
      url;
      max_response_bytes = null;
      headers;
      body = null;
      method = #get;
      transform = ?{
        function = transform;
        context = Blob.fromArray([]);
      };
      is_replicated = ?false;
    };
    let httpResponse = await (with cycles = httpRequestCycles) ic.http_request(request);
    switch (httpResponse.body.decodeUtf8()) {
      case (null) { Runtime.trap("empty HTTP response") };
      case (?decodedResponse) { decodedResponse };
    };
  };

  public func httpPostRequest(url : Text, extraHeaders : [Header], body : Text, transform : Transform) : async Text {
    let n = extraHeaders.size();
    let headers = Array.tabulate(
      n + 2,
      func(i) {
        if (i < n) { extraHeaders[i] } else if (i == n) {
          { name = "User-Agent"; value = "caffeine.ai" };
        } else {
          { name = "Idempotency-Key"; value = "Time-" # Time.now().toText() };
        };
      },
    );
    let requestBody = body.encodeUtf8();
    let request : HttpRequestArgs = {
      url;
      max_response_bytes = null;
      headers;
      body = ?requestBody;
      method = #post;
      transform = ?{
        function = transform;
        context = Blob.fromArray([]);
      };
      is_replicated = ?false;
    };
    let httpResponse = await (with cycles = httpRequestCycles) ic.http_request(request);
    switch (httpResponse.body.decodeUtf8()) {
      case (null) { Runtime.trap("empty HTTP response") };
      case (?decodedResponse) { decodedResponse };
    };
  };
};
