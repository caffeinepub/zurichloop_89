import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Option "mo:core/Option";
import Blob "mo:core/Blob";
import Char "mo:core/Char";
import Nat8 "mo:core/Nat8";
import Nat32 "mo:core/Nat32";
import OutCall "http-outcalls/outcall";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  // HTTP transform function - strips headers for determinism across replicas
  public query func transform({
    response : {
      status : Nat;
      headers : [{ name : Text; value : Text }];
      body : Blob;
    };
  }) : async {
    status : Nat;
    headers : [{ name : Text; value : Text }];
    body : Blob;
  } { { response with headers = [] } };

  // ==================== Type Definitions ====================

  type Time = Time.Time;

  // ID type aliases
  type TimeSlotId = Nat;
  type BookingId = Nat;

  // Booking status
  type BookingStatus = {
    #pending;
    #confirmed;
    #cancelled;
    #completed;
  };

  // Payment status
  type PaymentStatus = {
    #pending;
    #paid;
    #failed;
    #refunded;
  };

  // Time slot record
  type TimeSlot = {
    id : TimeSlotId;
    date : Text; // ISO date string (YYYY-MM-DD)
    startTime : Text; // HH:MM format
    endTime : Text; // HH:MM format
    maxCapacity : Nat;
    bookedCount : Nat;
  };

  // Booking record
  type Booking = {
    id : BookingId;
    timeSlotId : TimeSlotId;
    customerName : Text;
    customerEmail : Text;
    customerPhone : ?Text;
    participantCount : Nat;
    totalPrice : Nat; // In cents
    status : BookingStatus;
    paymentStatus : PaymentStatus;
    paymentId : ?Text;
    specialRequests : ?Text;
    createdAt : Time;
    updatedAt : Time;
  };

  // Tour photo
  type TourPhoto = {
    id : Text;
    url : Text;
    alt : Text;
    isPrimary : Bool;
  };

  // Meeting point coordinates
  type Coordinates = {
    lat : Float;
    lng : Float;
  };

  // Meeting point
  type MeetingPoint = {
    name : Text;
    address : Text;
    coordinates : Coordinates;
    instructions : Text;
    landmark : ?Text;
  };

  // Tour configuration
  type TourConfig = {
    title : Text;
    subtitle : Text;
    description : Text;
    duration : Nat; // Duration in minutes
    price : Nat; // Price per person in cents
    maxCapacity : Nat;
    photos : [TourPhoto];
    highlights : [Text];
    included : [Text];
    meetingPoint : MeetingPoint;
    isActive : Bool;
  };

  // Admin statistics
  type AdminStats = {
    totalBookings : Nat;
    upcomingBookings : Nat;
    completedBookings : Nat;
    cancelledBookings : Nat;
    totalRevenue : Nat;
    averageParticipants : Nat;
    averageBookingValue : Nat;
  };

  // ==================== Storage ====================

  // Time slots storage
  transient var timeSlotEntries : [(TimeSlotId, TimeSlot)] = [];
  transient var timeSlotsMap : Map.Map<TimeSlotId, TimeSlot> = Map.empty<TimeSlotId, TimeSlot>();
  transient var nextTimeSlotId : Nat = 1;

  // Bookings storage
  transient var bookingEntries : [(BookingId, Booking)] = [];
  transient var bookingsMap : Map.Map<BookingId, Booking> = Map.empty<BookingId, Booking>();
  transient var nextBookingId : Nat = 1;

  // Tour configuration (single tour)
  transient var tourConfig : TourConfig = {
    title = "Zurich Old Town Walking Tour";
    subtitle = "Discover the heart of Switzerland's largest city";
    description = "Join us for an unforgettable journey through Zurich's historic Old Town (Altstadt). This walking tour takes you through narrow cobblestone streets, past medieval guildhalls, and along the scenic banks of the Limmat River. Learn about Zurich's transformation from a Roman customs post to one of the world's leading financial centers.";
    duration = 150; // 2.5 hours
    price = 4500; // CHF 45.00
    maxCapacity = 15;
    photos = [
      {
        id = "1";
        url = "/images/zurich-grossmunster.jpg";
        alt = "Grossmünster Cathedral";
        isPrimary = true;
      },
      {
        id = "2";
        url = "/images/zurich-limmat.jpg";
        alt = "Limmat River";
        isPrimary = false;
      },
      {
        id = "3";
        url = "/images/zurich-oldtown.jpg";
        alt = "Old Town Streets";
        isPrimary = false;
      },
    ];
    highlights = [
      "Grossmünster Cathedral and its twin towers",
      "Fraumünster Church with Chagall windows",
      "Lindenhof Hill panoramic views",
      "Historic guild houses on Limmatquai",
      "Charming Niederdorf district",
      "Roman ruins at Thermengasse",
    ];
    included = [
      "Professional English-speaking guide",
      "Small group experience (max 15 people)",
      "Historical insights and local stories",
      "Photo opportunities at key landmarks",
    ];
    meetingPoint = {
      name = "Zurich Main Station (Hauptbahnhof)";
      address = "Bahnhofplatz, 8001 Zürich, Switzerland";
      coordinates = { lat = 47.3779; lng = 8.5403 };
      instructions = "Meet at the main entrance under the large clock. Look for our guide holding a red umbrella.";
      landmark = ?"The iconic Zürich HB clock tower";
    };
    isActive = true;
  };

  // ==================== Stripe Configuration Storage ====================

  // Stripe API key (seller-configured, persists across upgrades)
  transient var stripeAuthorization : Text = "";

  // Allowed origins for Stripe checkout redirects
  transient var allowedOriginEntries : [Text] = [];
  transient var allowedOriginsSet : Map.Map<Text, Bool> = Map.empty<Text, Bool>();

  // ==================== Email Configuration Storage ====================

  // Resend API key (seller-configured, persists across upgrades)
  transient var emailApiKey : Text = "";

  // Sender email address (must be verified in Resend)
  transient var senderEmail : Text = "";

  // Sender display name
  transient var senderName : Text = "Zurich Loop Tours";

  // ==================== System Callbacks ====================

  system func preupgrade() {
    timeSlotEntries := timeSlotsMap.entries().toArray();
    bookingEntries := bookingsMap.entries().toArray();
    var origins : [Text] = [];
    for ((o, _) in allowedOriginsSet.entries()) {
      origins := origins.concat([o]);
    };
    allowedOriginEntries := origins;
  };

  system func postupgrade() {
    for ((k, v) in timeSlotEntries.vals()) {
      timeSlotsMap.add(k, v);
    };
    for ((k, v) in bookingEntries.vals()) {
      bookingsMap.add(k, v);
    };
    for (o in allowedOriginEntries.vals()) {
      allowedOriginsSet.add(o, true);
    };
    timeSlotEntries := [];
    bookingEntries := [];
    allowedOriginEntries := [];
  };

  // ==================== Helper Functions ====================

  func requireAuth(caller : Principal) : () {
    if (caller.isAnonymous()) {
      Runtime.trap("Authentication required");
    };
  };

  func requireAdmin(caller : Principal) : () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Admin access required");
    };
  };

  // ==================== Public Functions ====================

  // Health check endpoint
  public shared query func healthCheck() : async Bool {
    true;
  };

  // Get caller's principal
  public shared query ({ caller }) func whoami() : async Principal {
    caller;
  };

  // ==================== Tour Configuration ====================

  // Get tour configuration (public)
  public shared query func getTourConfig() : async TourConfig {
    tourConfig;
  };

  // Get tour details for public display
  public shared query func getTourDetails() : async {
    title : Text;
    subtitle : Text;
    description : Text;
    duration : Nat;
    price : Nat;
    maxCapacity : Nat;
    highlights : [Text];
    included : [Text];
    meetingPoint : MeetingPoint;
    isActive : Bool;
    photoCount : Nat;
  } {
    {
      title = tourConfig.title;
      subtitle = tourConfig.subtitle;
      description = tourConfig.description;
      duration = tourConfig.duration;
      price = tourConfig.price;
      maxCapacity = tourConfig.maxCapacity;
      highlights = tourConfig.highlights;
      included = tourConfig.included;
      meetingPoint = tourConfig.meetingPoint;
      isActive = tourConfig.isActive;
      photoCount = tourConfig.photos.size();
    };
  };

  // Update tour configuration (admin only)
  public shared ({ caller }) func updateTourConfig(
    title : ?Text,
    subtitle : ?Text,
    description : ?Text,
    duration : ?Nat,
    price : ?Nat,
    maxCapacity : ?Nat,
    highlights : ?[Text],
    included : ?[Text],
    isActive : ?Bool,
  ) : async TourConfig {
    requireAdmin(caller);
    tourConfig := {
      title = title.get(tourConfig.title);
      subtitle = subtitle.get(tourConfig.subtitle);
      description = description.get(tourConfig.description);
      duration = duration.get(tourConfig.duration);
      price = price.get(tourConfig.price);
      maxCapacity = maxCapacity.get(tourConfig.maxCapacity);
      photos = tourConfig.photos;
      highlights = highlights.get(tourConfig.highlights);
      included = included.get(tourConfig.included);
      meetingPoint = tourConfig.meetingPoint;
      isActive = isActive.get(tourConfig.isActive);
    };
    tourConfig;
  };

  // Update meeting point (admin only)
  public shared ({ caller }) func updateMeetingPoint(
    name : Text,
    address : Text,
    lat : Float,
    lng : Float,
    instructions : Text,
    landmark : ?Text,
  ) : async MeetingPoint {
    requireAdmin(caller);
    let newMeetingPoint : MeetingPoint = {
      name;
      address;
      coordinates = { lat; lng };
      instructions;
      landmark;
    };
    tourConfig := {
      tourConfig with
      meetingPoint = newMeetingPoint;
    };
    newMeetingPoint;
  };

  // ==================== Time Slot Management ====================

  // Create new time slot (admin only)
  public shared ({ caller }) func createTimeSlot(
    date : Text,
    startTime : Text,
    endTime : Text,
    maxCapacity : Nat,
  ) : async TimeSlot {
    requireAdmin(caller);
    let id = nextTimeSlotId;
    nextTimeSlotId += 1;
    let slot : TimeSlot = {
      id;
      date;
      startTime;
      endTime;
      maxCapacity;
      bookedCount = 0;
    };
    timeSlotsMap.add(id, slot);
    slot;
  };

  // Get single time slot
  public shared query func getTimeSlot(slotId : TimeSlotId) : async ?TimeSlot {
    timeSlotsMap.get(slotId);
  };

  // Update time slot (admin only)
  public shared ({ caller }) func updateTimeSlot(
    slotId : TimeSlotId,
    date : ?Text,
    startTime : ?Text,
    endTime : ?Text,
    maxCapacity : ?Nat,
  ) : async TimeSlot {
    requireAdmin(caller);
    switch (timeSlotsMap.get(slotId)) {
      case (null) { Runtime.trap("Time slot not found") };
      case (?slot) {
        let updatedSlot : TimeSlot = {
          id = slot.id;
          date = date.get(slot.date);
          startTime = startTime.get(slot.startTime);
          endTime = endTime.get(slot.endTime);
          maxCapacity = maxCapacity.get(slot.maxCapacity);
          bookedCount = slot.bookedCount;
        };
        timeSlotsMap.add(slotId, updatedSlot);
        updatedSlot;
      };
    };
  };

  // Delete time slot (admin only, only if no bookings)
  public shared ({ caller }) func deleteTimeSlot(slotId : TimeSlotId) : async Bool {
    requireAdmin(caller);
    switch (timeSlotsMap.get(slotId)) {
      case (null) { Runtime.trap("Time slot not found") };
      case (?slot) {
        if (slot.bookedCount > 0) {
          Runtime.trap("Cannot delete slot with existing bookings");
        };
        timeSlotsMap.remove(slotId);
        true;
      };
    };
  };

  // Get available slots within date range (public)
  public shared query func getAvailableSlots(startDate : Text, endDate : Text) : async [TimeSlot] {
    let slots = timeSlotsMap.values().toArray().filter(
      func(slot) {
        slot.date >= startDate and slot.date <= endDate and slot.bookedCount < slot.maxCapacity
      }
    );
    // Sort by date and start time
    slots.sort(
      func(a, b) {
        let dateCompare = Text.compare(a.date, b.date);
        if (dateCompare == #equal) {
          Text.compare(a.startTime, b.startTime);
        } else {
          dateCompare;
        };
      }
    );
  };

  // Get all slots within date range (admin only)
  public shared query ({ caller }) func getAllSlots(startDate : Text, endDate : Text) : async [TimeSlot] {
    requireAdmin(caller);
    let slots = timeSlotsMap.values().toArray().filter(
      func(slot) {
        slot.date >= startDate and slot.date <= endDate
      }
    );
    slots.sort(
      func(a, b) {
        let dateCompare = Text.compare(a.date, b.date);
        if (dateCompare == #equal) {
          Text.compare(a.startTime, b.startTime);
        } else {
          dateCompare;
        };
      }
    );
  };

  // Get available capacity for a slot
  public shared query func getAvailableCapacity(slotId : TimeSlotId) : async Nat {
    switch (timeSlotsMap.get(slotId)) {
      case (null) { Runtime.trap("Time slot not found") };
      case (?slot) { slot.maxCapacity - slot.bookedCount };
    };
  };

  // Check availability for specific participant count
  public shared query func checkAvailability(slotId : TimeSlotId, participantCount : Nat) : async Bool {
    switch (timeSlotsMap.get(slotId)) {
      case (null) { false };
      case (?slot) { slot.maxCapacity >= slot.bookedCount + participantCount };
    };
  };

  // ==================== Booking Management ====================

  // Create new booking
  public shared ({ caller }) func createBooking(
    timeSlotId : TimeSlotId,
    customerName : Text,
    customerEmail : Text,
    customerPhone : ?Text,
    participantCount : Nat,
    specialRequests : ?Text,
  ) : async Booking {
    requireAuth(caller);
    // Validate time slot exists and has capacity
    switch (timeSlotsMap.get(timeSlotId)) {
      case (null) { Runtime.trap("Time slot not found") };
      case (?slot) {
        if (slot.maxCapacity < slot.bookedCount + participantCount) {
          Runtime.trap("Not enough capacity available");
        };

        let now = Time.now();
        let bookingId = nextBookingId;
        nextBookingId += 1;

        let booking : Booking = {
          id = bookingId;
          timeSlotId;
          customerName;
          customerEmail;
          customerPhone;
          participantCount;
          totalPrice = tourConfig.price * participantCount;
          status = #pending;
          paymentStatus = #pending;
          paymentId = null;
          specialRequests;
          createdAt = now;
          updatedAt = now;
        };

        // Reserve capacity
        let updatedSlot : TimeSlot = {
          slot with
          bookedCount = slot.bookedCount + participantCount;
        };
        timeSlotsMap.add(timeSlotId, updatedSlot);
        bookingsMap.add(bookingId, booking);

        booking;
      };
    };
  };

  // Get booking by ID (admin only)
  public shared query ({ caller }) func getBooking(bookingId : BookingId) : async ?Booking {
    requireAdmin(caller);
    bookingsMap.get(bookingId);
  };

  // Confirm booking after payment (admin only)
  public shared ({ caller }) func confirmBooking(bookingId : BookingId, paymentId : Text) : async Booking {
    requireAdmin(caller);
    switch (bookingsMap.get(bookingId)) {
      case (null) { Runtime.trap("Booking not found") };
      case (?booking) {
        if (booking.status != #pending) {
          Runtime.trap("Booking is not in pending status");
        };
        let updatedBooking : Booking = {
          booking with
          status = #confirmed;
          paymentStatus = #paid;
          paymentId = ?paymentId;
          updatedAt = Time.now();
        };
        bookingsMap.add(bookingId, updatedBooking);
        updatedBooking;
      };
    };
  };

  // Cancel booking and restore capacity (admin only)
  public shared ({ caller }) func cancelBooking(bookingId : BookingId) : async Booking {
    requireAdmin(caller);
    switch (bookingsMap.get(bookingId)) {
      case (null) { Runtime.trap("Booking not found") };
      case (?booking) {
        if (booking.status == #cancelled) {
          Runtime.trap("Booking is already cancelled");
        };

        // Restore capacity to time slot
        switch (timeSlotsMap.get(booking.timeSlotId)) {
          case (null) {};
          case (?slot) {
            let newBookedCount = if (slot.bookedCount >= booking.participantCount) {
              slot.bookedCount - booking.participantCount;
            } else { 0 };
            let updatedSlot : TimeSlot = {
              slot with
              bookedCount = newBookedCount;
            };
            timeSlotsMap.add(booking.timeSlotId, updatedSlot);
          };
        };

        let updatedBooking : Booking = {
          booking with
          status = #cancelled;
          paymentStatus = if (booking.paymentStatus == #paid) {
            #refunded;
          } else { booking.paymentStatus };
          updatedAt = Time.now();
        };
        bookingsMap.add(bookingId, updatedBooking);
        updatedBooking;
      };
    };
  };

  // Mark booking as completed (admin only)
  public shared ({ caller }) func completeBooking(bookingId : BookingId) : async Booking {
    requireAdmin(caller);
    switch (bookingsMap.get(bookingId)) {
      case (null) { Runtime.trap("Booking not found") };
      case (?booking) {
        if (booking.status != #confirmed) {
          Runtime.trap("Only confirmed bookings can be marked as completed");
        };
        let updatedBooking : Booking = {
          booking with
          status = #completed;
          updatedAt = Time.now();
        };
        bookingsMap.add(bookingId, updatedBooking);
        updatedBooking;
      };
    };
  };

  // Get all bookings for a time slot (admin only)
  public shared query ({ caller }) func getBookingsBySlot(slotId : TimeSlotId) : async [Booking] {
    requireAdmin(caller);
    bookingsMap.values().toArray().filter(func(booking) { booking.timeSlotId == slotId });
  };

  // Get upcoming bookings (admin only)
  public shared query ({ caller }) func getUpcomingBookings() : async [Booking] {
    requireAdmin(caller);
    let allBookings = bookingsMap.values().toArray().filter(
      func(booking) {
        booking.status == #pending or booking.status == #confirmed;
      }
    );
    allBookings.sort(
      func(a, b) {
        if (a.createdAt < b.createdAt) { #less } else if (a.createdAt > b.createdAt) {
          #greater;
        } else { #equal };
      }
    );
  };

  // Get bookings by customer email (admin only)
  public shared query ({ caller }) func getBookingsByEmail(email : Text) : async [Booking] {
    requireAdmin(caller);
    bookingsMap.values().toArray().filter(func(booking) { booking.customerEmail == email });
  };

  // Get all bookings (admin only)
  public shared query ({ caller }) func getAllBookings() : async [Booking] {
    requireAdmin(caller);
    bookingsMap.values().toArray();
  };

  // ==================== Admin Statistics ====================

  // Get booking statistics (admin only)
  public shared query ({ caller }) func getBookingStats() : async AdminStats {
    requireAdmin(caller);
    var totalBookings : Nat = 0;
    var upcomingBookings : Nat = 0;
    var completedBookings : Nat = 0;
    var cancelledBookings : Nat = 0;
    var totalRevenue : Nat = 0;
    var totalParticipants : Nat = 0;

    for ((_, booking) in bookingsMap.entries()) {
      totalBookings += 1;
      totalParticipants += booking.participantCount;

      switch (booking.status) {
        case (#pending) { upcomingBookings += 1 };
        case (#confirmed) {
          upcomingBookings += 1;
          if (booking.paymentStatus == #paid) {
            totalRevenue += booking.totalPrice;
          };
        };
        case (#completed) {
          completedBookings += 1;
          totalRevenue += booking.totalPrice;
        };
        case (#cancelled) { cancelledBookings += 1 };
      };
    };

    let avgParticipants = if (totalBookings > 0) {
      totalParticipants / totalBookings;
    } else { 0 };
    let paidBookings = completedBookings + upcomingBookings;
    let avgBookingValue = if (paidBookings > 0) { totalRevenue / paidBookings } else {
      0;
    };

    {
      totalBookings;
      upcomingBookings;
      completedBookings;
      cancelledBookings;
      totalRevenue;
      averageParticipants = avgParticipants;
      averageBookingValue = avgBookingValue;
    };
  };

  // Get revenue for a date range (admin only)
  public shared query ({ caller }) func getRevenueByPeriod(startDate : Text, endDate : Text) : async {
    totalRevenue : Nat;
    bookingCount : Nat;
    participantCount : Nat;
  } {
    requireAdmin(caller);
    var totalRevenue : Nat = 0;
    var bookingCount : Nat = 0;
    var participantCount : Nat = 0;

    for ((_, booking) in bookingsMap.entries()) {
      // Get the slot to check its date
      switch (timeSlotsMap.get(booking.timeSlotId)) {
        case (null) {};
        case (?slot) {
          if (slot.date >= startDate and slot.date <= endDate) {
            if (booking.status == #confirmed or booking.status == #completed) {
              if (booking.paymentStatus == #paid) {
                totalRevenue += booking.totalPrice;
                bookingCount += 1;
                participantCount += booking.participantCount;
              };
            };
          };
        };
      };
    };

    { totalRevenue; bookingCount; participantCount };
  };

  // Calendar slot summary type
  type SlotSummary = {
    id : Nat;
    startTime : Text;
    endTime : Text;
    bookedCount : Nat;
    maxCapacity : Nat;
  };

  type DateSlotSummary = {
    date : Text;
    slots : [SlotSummary];
    totalBookings : Nat;
    totalCapacity : Nat;
  };

  // Get slots with booking counts for calendar view (admin only)
  public shared query ({ caller }) func getSlotsForCalendar(startDate : Text, endDate : Text) : async [DateSlotSummary] {
    requireAdmin(caller);
    // Group slots by date
    var dateMap : Map.Map<Text, [TimeSlot]> = Map.empty<Text, [TimeSlot]>();

    for ((_, slot) in timeSlotsMap.entries()) {
      if (slot.date >= startDate and slot.date <= endDate) {
        switch (dateMap.get(slot.date)) {
          case (null) {
            dateMap.add(slot.date, [slot]);
          };
          case (?existing) {
            dateMap.add(slot.date, existing.concat([slot]));
          };
        };
      };
    };

    let entries = dateMap.entries().toArray();
    var result : [DateSlotSummary] = [];

    for ((date, slots) in entries.vals()) {
      var totalBookings : Nat = 0;
      var totalCapacity : Nat = 0;
      var slotSummaries : [SlotSummary] = [];

      for (slot in slots.vals()) {
        totalBookings += slot.bookedCount;
        totalCapacity += slot.maxCapacity;
        slotSummaries := slotSummaries.concat([{
          id = slot.id;
          startTime = slot.startTime;
          endTime = slot.endTime;
          bookedCount = slot.bookedCount;
          maxCapacity = slot.maxCapacity;
        }]);
      };

      result := result.concat([{
        date;
        slots = slotSummaries;
        totalBookings;
        totalCapacity;
      }]);
    };

    result.sort(func(a, b) { Text.compare(a.date, b.date) });
  };

  // ==================== Stripe Helper Functions ====================

  // URL encode a character
  func urlEncodeChar(c : Char) : Text {
    let n = c.toNat32();
    if ((n >= 65 and n <= 90) or (n >= 97 and n <= 122) or (n >= 48 and n <= 57) or c == '-' or c == '_' or c == '.' or c == '~') {
      Text.fromChar(c);
    } else {
      let hex = "0123456789ABCDEF";
      let hexChars = hex.chars().toArray();
      let byte = Nat8.fromNat(n.toNat() % 256);
      let hi = (byte / 16).toNat();
      let lo = (byte % 16).toNat();
      "%" # Text.fromChar(hexChars[hi]) # Text.fromChar(hexChars[lo]);
    };
  };

  // URL encode text for form data
  func urlEncode(text : Text) : Text {
    var result = "";
    for (c in text.chars()) {
      result #= urlEncodeChar(c);
    };
    result;
  };

  // Extract a string field from JSON (simple parser using split)
  func extractJsonStringField(json : Text, field : Text) : ?Text {
    let patterns = ["\"" # field # "\":\"", "\"" # field # "\": \""];
    for (pattern in patterns.vals()) {
      if (json.contains(#text pattern)) {
        let parts = json.split(#text pattern);
        switch (parts.next()) {
          case (null) {};
          case (?_) {
            switch (parts.next()) {
              case (?afterPattern) {
                switch (afterPattern.split(#text "\"").next()) {
                  case (?value) { if (value.size() > 0) { return ?value } };
                  case (_) {};
                };
              };
              case (null) {};
            };
          };
        };
      };
    };
    null;
  };

  // Normalize origin from URL (extract scheme + host)
  func normalizeOrigin(url : Text) : Text {
    // Find :// to get past scheme
    if (url.contains(#text "://")) {
      let parts = url.split(#text "://");
      switch (parts.next()) {
        case (?scheme) {
          switch (parts.next()) {
            case (?afterScheme) {
              // Find end of host (first / or end of string)
              let hostParts = afterScheme.split(#text "/");
              switch (hostParts.next()) {
                case (?host) {
                  scheme # "://" # host;
                };
                case (null) { url };
              };
            };
            case (null) { url };
          };
        };
        case (null) { url };
      };
    } else {
      url;
    };
  };

  // Check if URL origin is in allowed origins
  func isValidCheckoutDomain(url : Text) : Bool {
    let origin = normalizeOrigin(url);
    switch (allowedOriginsSet.get(origin)) {
      case (?true) { true };
      case (_) { false };
    };
  };

  // Call Stripe API
  func callStripe(endpoint : Text, method : { #get; #post }, body : ?Text) : async Text {
    if (stripeAuthorization == "") {
      Runtime.trap("Stripe API key not configured");
    };

    let url = "https://api.stripe.com/" # endpoint;
    let headers : [OutCall.Header] = [
      { name = "content-type"; value = "application/x-www-form-urlencoded" },
      { name = "authorization"; value = "Bearer " # stripeAuthorization },
    ];

    switch (method) {
      case (#get) {
        await OutCall.httpGetRequest(url, headers, transform);
      };
      case (#post) {
        let bodyText = switch (body) {
          case (null) { "" };
          case (?b) { b };
        };
        await OutCall.httpPostRequest(url, headers, bodyText, transform);
      };
    };
  };

  // Check if payment was successful
  func isPaymentSuccessful(paymentStatus : ?Text, sessionStatus : ?Text) : Bool {
    switch (paymentStatus, sessionStatus) {
      case (?"paid", ?"complete") { true };
      case (?"no_payment_required", ?"complete") { true };
      case (_, _) { false };
    };
  };

  // ==================== Stripe Admin Configuration Functions ====================

  // Set Stripe API key (admin only, validates with Stripe)
  public shared ({ caller }) func setStripeAuthorization(key : Text) : async Text {
    requireAdmin(caller);

    if (key == "") {
      Runtime.trap("API key cannot be empty");
    };

    // Validate key format (must start with sk_ or rk_)
    if (not (key.startsWith(#text "sk_") or key.startsWith(#text "rk_"))) {
      Runtime.trap("Invalid API key format. Key must start with 'sk_' or 'rk_'");
    };

    // Validate key by calling Stripe account endpoint
    let tempAuth = stripeAuthorization;
    stripeAuthorization := key;

    try {
      ignore await callStripe("v1/account", #get, null);
      "Stripe API key validated and saved successfully";
    } catch (_) {
      stripeAuthorization := tempAuth; // Restore previous key on failure
      Runtime.trap("Invalid Stripe API key");
    };
  };

  // Get masked Stripe key status (admin only)
  public shared query ({ caller }) func getStripeKeyStatus() : async ?Text {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      return null;
    };
    if (stripeAuthorization == "") {
      return null;
    };
    // Return masked key (first 7 chars + ... + last 4 chars)
    let chars = stripeAuthorization.chars().toArray();
    let len = chars.size();
    if (len <= 11) {
      return ?"sk_****";
    };
    let prefix = Text.fromIter(Array.tabulate<Char>(7, func(i) { chars[i] }).vals());
    let suffix = Text.fromIter(Array.tabulate<Char>(4, func(i) { chars[len - 4 + i] }).vals());
    ?(prefix # "..." # suffix);
  };

  // Add allowed origin (admin only)
  public shared ({ caller }) func addAllowedOrigin(origin : Text) : async () {
    requireAdmin(caller);
    let normalized = normalizeOrigin(origin);
    allowedOriginsSet.add(normalized, true);
  };

  // Remove allowed origin (admin only)
  public shared ({ caller }) func removeAllowedOrigin(origin : Text) : async () {
    requireAdmin(caller);
    let normalized = normalizeOrigin(origin);
    allowedOriginsSet.remove(normalized);
  };

  // Get all allowed origins (admin only)
  public shared query ({ caller }) func getAllowedOrigins() : async [Text] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      return [];
    };
    var result : [Text] = [];
    for ((o, _) in allowedOriginsSet.entries()) {
      result := result.concat([o]);
    };
    result;
  };

  // ==================== Stripe Checkout Session Functions ====================

  // Build checkout session body
  func buildCheckoutSessionBody(booking : Booking, successUrl : Text, cancelUrl : Text) : Text {
    let priceInCents = booking.totalPrice;
    let productName = urlEncode(tourConfig.title);
    let productDesc = urlEncode("Tour booking for " # booking.participantCount.toText() # " participant(s)");

    // Build form-encoded body
    var body = "";
    body #= "line_items[0][price_data][currency]=chf";
    body #= "&line_items[0][price_data][product_data][name]=" # productName;
    body #= "&line_items[0][price_data][product_data][description]=" # productDesc;
    body #= "&line_items[0][price_data][unit_amount]=" # priceInCents.toText();
    body #= "&line_items[0][quantity]=1";
    body #= "&mode=payment";
    let successSep = if (successUrl.contains(#char '?')) { "&" } else { "?" };
    let cancelSep = if (cancelUrl.contains(#char '?')) { "&" } else { "?" };
    body #= "&success_url=" # urlEncode(successUrl # successSep # "payment=success&session_id={CHECKOUT_SESSION_ID}&booking_id=" # booking.id.toText());
    body #= "&cancel_url=" # urlEncode(cancelUrl # cancelSep # "payment=cancelled&booking_id=" # booking.id.toText());
    body #= "&client_reference_id=booking_" # booking.id.toText();
    body #= "&customer_email=" # urlEncode(booking.customerEmail);

    body;
  };

  // Create Stripe checkout session
  public shared ({ caller }) func createCheckoutSession(bookingId : BookingId, successUrl : Text, cancelUrl : Text) : async Text {
    requireAuth(caller);
    // Validate booking exists and is pending
    let booking = switch (bookingsMap.get(bookingId)) {
      case (null) { Runtime.trap("Booking not found") };
      case (?b) { b };
    };

    if (booking.status != #pending) {
      Runtime.trap("Booking is not in pending status");
    };

    // Validate URLs are from allowed origins
    if (not isValidCheckoutDomain(successUrl)) {
      Runtime.trap("Success URL domain not in allowed origins. Add it in Stripe Settings first.");
    };
    if (not isValidCheckoutDomain(cancelUrl)) {
      Runtime.trap("Cancel URL domain not in allowed origins. Add it in Stripe Settings first.");
    };

    // Build and send request to Stripe
    let body = buildCheckoutSessionBody(booking, successUrl, cancelUrl);
    let response = await callStripe("v1/checkout/sessions", #post, ?body);

    // Return the full response JSON (frontend will parse checkout URL)
    response;
  };

  // Verify payment and confirm booking
  public shared ({ caller }) func verifyAndConfirmBooking(sessionId : Text, bookingId : BookingId) : async Booking {
    requireAuth(caller);
    // Validate session ID format
    if (not sessionId.startsWith(#text "cs_")) {
      Runtime.trap("Invalid session ID format");
    };

    // Get booking
    let booking = switch (bookingsMap.get(bookingId)) {
      case (null) { Runtime.trap("Booking not found") };
      case (?b) { b };
    };

    if (booking.status != #pending) {
      // Already processed - return current state
      return booking;
    };

    // Fetch session from Stripe
    let response = await callStripe("v1/checkout/sessions/" # sessionId, #get, null);

    // Parse payment status
    let paymentStatus = extractJsonStringField(response, "payment_status");
    let sessionStatus = extractJsonStringField(response, "status");
    let clientRefId = extractJsonStringField(response, "client_reference_id");

    // Verify client_reference_id matches
    let expectedRefId = "booking_" # bookingId.toText();
    switch (clientRefId) {
      case (null) {
        Runtime.trap("Missing client_reference_id in Stripe response");
      };
      case (?refId) {
        if (refId != expectedRefId) {
          Runtime.trap("Session does not match booking (expected " # expectedRefId # ", got " # refId # ")");
        };
      };
    };

    // Check if payment was successful
    if (not isPaymentSuccessful(paymentStatus, sessionStatus)) {
      Runtime.trap("Payment not completed. Status: " # paymentStatus.get("unknown") # ", Session: " # sessionStatus.get("unknown"));
    };

    // Confirm the booking
    let updatedBooking : Booking = {
      booking with
      status = #confirmed;
      paymentStatus = #paid;
      paymentId = ?sessionId;
      updatedAt = Time.now();
    };
    bookingsMap.add(bookingId, updatedBooking);

    updatedBooking;
  };

  // ==================== Email Helper Functions ====================

  // Call Resend API
  func callResendApi(endpoint : Text, method : { #get; #post }, body : ?Text) : async Text {
    if (emailApiKey == "") {
      Runtime.trap("Email API key not configured");
    };

    let url = "https://api.resend.com/" # endpoint;
    let headers : [OutCall.Header] = [
      { name = "content-type"; value = "application/json" },
      { name = "authorization"; value = "Bearer " # emailApiKey },
    ];

    switch (method) {
      case (#get) {
        await OutCall.httpGetRequest(url, headers, transform);
      };
      case (#post) {
        let bodyText = switch (body) {
          case (null) { "" };
          case (?b) { b };
        };
        await OutCall.httpPostRequest(url, headers, bodyText, transform);
      };
    };
  };

  // Escape JSON string
  func escapeJsonString(text : Text) : Text {
    var result = "";
    for (c in text.chars()) {
      let code = c.toNat32();
      if (code == 34) {
        // " (double quote)
        result #= "\\\"";
      } else if (code == 92) {
        // \ (backslash)
        result #= "\\\\";
      } else if (code == 10) {
        // \n (newline)
        result #= "\\n";
      } else if (code == 13) {
        // \r (carriage return)
        result #= "\\r";
      } else if (code == 9) {
        // \t (tab)
        result #= "\\t";
      } else {
        result #= Text.fromChar(c);
      };
    };
    result;
  };

  // Format price in CHF
  func formatPrice(priceInCents : Nat) : Text {
    let francs = priceInCents / 100;
    let cents = priceInCents % 100;
    let centsStr = if (cents < 10) { "0" # cents.toText() } else {
      cents.toText();
    };
    "CHF " # francs.toText() # "." # centsStr;
  };

  // Build confirmation email HTML
  func buildConfirmationEmailHtml(booking : Booking, timeSlot : TimeSlot) : Text {
    let config = tourConfig;

    "<html><body style=\"font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;\">" #
    "<div style=\"background: white; border-radius: 16px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);\">" #

    // Header
    "<div style=\"text-align: center; margin-bottom: 32px;\">" #
    "<h1 style=\"color: #1e293b; margin: 0 0 8px 0; font-size: 24px;\">Booking Confirmed!</h1>" #
    "<p style=\"color: #64748b; margin: 0;\">Thank you for your booking</p>" #
    "</div>" #

    // Booking Reference
    "<div style=\"background: #f1f5f9; border-radius: 12px; padding: 16px; margin-bottom: 24px; text-align: center;\">" #
    "<p style=\"color: #64748b; margin: 0 0 4px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;\">Booking Reference</p>" #
    "<p style=\"color: #1e293b; margin: 0; font-size: 24px; font-weight: bold; font-family: monospace;\">#" # booking.id.toText() # "</p>" #
    "</div>" #

    // Tour Details
    "<h2 style=\"color: #1e293b; font-size: 18px; margin: 24px 0 16px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;\">Tour Details</h2>" #
    "<table style=\"width: 100%; border-collapse: collapse;\">" #
    "<tr><td style=\"padding: 8px 0; color: #64748b;\">Tour</td><td style=\"padding: 8px 0; color: #1e293b; text-align: right; font-weight: 500;\">" # escapeJsonString(config.title) # "</td></tr>" #
    "<tr><td style=\"padding: 8px 0; color: #64748b;\">Date</td><td style=\"padding: 8px 0; color: #1e293b; text-align: right; font-weight: 500;\">" # timeSlot.date # "</td></tr>" #
    "<tr><td style=\"padding: 8px 0; color: #64748b;\">Time</td><td style=\"padding: 8px 0; color: #1e293b; text-align: right; font-weight: 500;\">" # timeSlot.startTime # " - " # timeSlot.endTime # "</td></tr>" #
    "<tr><td style=\"padding: 8px 0; color: #64748b;\">Participants</td><td style=\"padding: 8px 0; color: #1e293b; text-align: right; font-weight: 500;\">" # booking.participantCount.toText() # " person(s)</td></tr>" #
    "<tr><td style=\"padding: 8px 0; color: #64748b;\">Duration</td><td style=\"padding: 8px 0; color: #1e293b; text-align: right; font-weight: 500;\">" # config.duration.toText() # " minutes</td></tr>" #
    "</table>" #

    // Payment Summary
    "<h2 style=\"color: #1e293b; font-size: 18px; margin: 24px 0 16px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;\">Payment Summary</h2>" #
    "<table style=\"width: 100%; border-collapse: collapse;\">" #
    "<tr><td style=\"padding: 8px 0; color: #64748b;\">Price per person</td><td style=\"padding: 8px 0; color: #1e293b; text-align: right;\">" # formatPrice(config.price) # "</td></tr>" #
    "<tr><td style=\"padding: 8px 0; color: #64748b;\">Participants</td><td style=\"padding: 8px 0; color: #1e293b; text-align: right;\">x " # booking.participantCount.toText() # "</td></tr>" #
    "<tr style=\"border-top: 2px solid #e2e8f0;\"><td style=\"padding: 12px 0 8px 0; color: #1e293b; font-weight: bold;\">Total Paid</td><td style=\"padding: 12px 0 8px 0; color: #1e293b; text-align: right; font-weight: bold; font-size: 18px;\">" # formatPrice(booking.totalPrice) # "</td></tr>" #
    "</table>" #

    // Meeting Point
    "<h2 style=\"color: #1e293b; font-size: 18px; margin: 24px 0 16px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;\">Meeting Point</h2>" #
    "<div style=\"background: #fef3c7; border-radius: 12px; padding: 16px; border-left: 4px solid #f59e0b;\">" #
    "<p style=\"color: #92400e; margin: 0 0 8px 0; font-weight: bold;\">" # escapeJsonString(config.meetingPoint.name) # "</p>" #
    "<p style=\"color: #92400e; margin: 0 0 8px 0;\">" # escapeJsonString(config.meetingPoint.address) # "</p>" #
    "<p style=\"color: #92400e; margin: 0; font-style: italic;\">" # escapeJsonString(config.meetingPoint.instructions) # "</p>" #
    "</div>" #

    // What to Bring
    "<h2 style=\"color: #1e293b; font-size: 18px; margin: 24px 0 16px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;\">What to Bring</h2>" #
    "<ul style=\"color: #64748b; margin: 0; padding-left: 20px;\">" #
    "<li style=\"margin-bottom: 8px;\">Comfortable walking shoes</li>" #
    "<li style=\"margin-bottom: 8px;\">Weather-appropriate clothing</li>" #
    "<li style=\"margin-bottom: 8px;\">Camera (optional)</li>" #
    "<li style=\"margin-bottom: 8px;\">Water bottle</li>" #
    "</ul>" #

    // Footer
    "<div style=\"margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0; text-align: center;\">" #
    "<p style=\"color: #64748b; margin: 0 0 8px 0; font-size: 14px;\">Questions? Contact us at the email address in your account.</p>" #
    "<p style=\"color: #94a3b8; margin: 0; font-size: 12px;\">This confirmation was sent to " # escapeJsonString(booking.customerEmail) # "</p>" #
    "</div>" #

    "</div></body></html>";
  };

  // Build email JSON payload
  func buildEmailPayload(to : Text, subject : Text, htmlContent : Text) : Text {
    let fromAddr = if (senderEmail == "") { "onboarding@resend.dev" } else {
      senderEmail;
    };
    let fromName = senderName;

    "{" #
    "\"from\": \"" # escapeJsonString(fromName) # " <" # escapeJsonString(fromAddr) # ">\"," #
    "\"to\": [\"" # escapeJsonString(to) # "\"]," #
    "\"subject\": \"" # escapeJsonString(subject) # "\"," #
    "\"html\": \"" # escapeJsonString(htmlContent) # "\"" #
    "}";
  };

  // ==================== Email Admin Configuration Functions ====================

  // Set Email API key (admin only, validates format)
  public shared ({ caller }) func setEmailApiKey(key : Text) : async Text {
    requireAdmin(caller);

    if (key == "") {
      Runtime.trap("API key cannot be empty");
    };

    // Validate key format (must start with re_)
    if (not key.startsWith(#text "re_")) {
      Runtime.trap("Invalid API key format. Key must start with 're_'");
    };

    emailApiKey := key;
    "Email API key saved successfully";
  };

  // Get masked Email API key status (admin only)
  public shared query ({ caller }) func getEmailKeyStatus() : async ?Text {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      return null;
    };
    if (emailApiKey == "") {
      return null;
    };
    // Return masked key (first 6 chars + ... + last 4 chars)
    let chars = emailApiKey.chars().toArray();
    let len = chars.size();
    if (len <= 10) {
      return ?"re_****";
    };
    let prefix = Text.fromIter(Array.tabulate<Char>(6, func(i) { chars[i] }).vals());
    let suffix = Text.fromIter(Array.tabulate<Char>(4, func(i) { chars[len - 4 + i] }).vals());
    ?(prefix # "..." # suffix);
  };

  // Set sender email (admin only)
  public shared ({ caller }) func setSenderEmail(email : Text) : async () {
    requireAdmin(caller);
    senderEmail := email;
  };

  // Get sender email (admin only)
  public shared query ({ caller }) func getSenderEmail() : async ?Text {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      return null;
    };
    if (senderEmail == "") {
      return null;
    };
    ?senderEmail;
  };

  // Set sender name (admin only)
  public shared ({ caller }) func setSenderName(name : Text) : async () {
    requireAdmin(caller);
    senderName := name;
  };

  // Get sender name (admin only)
  public shared query func getSenderName() : async Text {
    senderName;
  };

  // ==================== Email Sending Functions ====================

  // Send booking confirmation email (admin only)
  public shared ({ caller }) func sendBookingConfirmationEmail(bookingId : BookingId) : async Text {
    requireAdmin(caller);
    // Get booking
    let booking = switch (bookingsMap.get(bookingId)) {
      case (null) { Runtime.trap("Booking not found") };
      case (?b) { b };
    };

    // Get time slot
    let timeSlot = switch (timeSlotsMap.get(booking.timeSlotId)) {
      case (null) { Runtime.trap("Time slot not found") };
      case (?s) { s };
    };

    // Build email
    let htmlContent = buildConfirmationEmailHtml(booking, timeSlot);
    let subject = "Booking Confirmed - " # tourConfig.title # " (#" # bookingId.toText() # ")";
    let payload = buildEmailPayload(booking.customerEmail, subject, htmlContent);

    // Send email
    let response = await callResendApi("emails", #post, ?payload);

    response;
  };

  // Send test email (admin only)
  public shared ({ caller }) func sendTestEmail(toEmail : Text) : async Text {
    requireAdmin(caller);

    let htmlContent = "<html><body style=\"font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;\">" #
    "<div style=\"background: white; border-radius: 16px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);\">" #
    "<h1 style=\"color: #1e293b; margin: 0 0 16px 0;\">Test Email</h1>" #
    "<p style=\"color: #64748b;\">This is a test email from ZurichLoop to verify your email configuration is working correctly.</p>" #
    "<p style=\"color: #64748b; margin-top: 24px;\">If you received this email, your Resend integration is properly configured!</p>" #
    "</div></body></html>";

    let subject = "Test Email from ZurichLoop";
    let payload = buildEmailPayload(toEmail, subject, htmlContent);

    let response = await callResendApi("emails", #post, ?payload);

    response;
  };
};
