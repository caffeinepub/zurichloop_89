import React from "react";

const photos = [
  {
    id: "1",
    src: "https://images.pexels.com/photos/29148084/pexels-photo-29148084.jpeg?_gl=1*18ensld*_ga*MTY3MTYwNjg2OC4xNzcwNjM3ODU2*_ga_8JE65Q40S6*czE3NzA2NTAyNjAkbzQkZzEkdDE3NzA2NTE5MzIkajI0JGwwJGgw",
  },
  {
    id: "2",
    src: "https://images.pexels.com/photos/19239877/pexels-photo-19239877.jpeg?_gl=1*100dqqg*_ga*MTY3MTYwNjg2OC4xNzcwNjM3ODU2*_ga_8JE65Q40S6*czE3NzA2NTAyNjAkbzQkZzEkdDE3NzA2NTIwMzgkajU3JGwwJGgw",
  },
  {
    id: "3",
    src: "https://images.pexels.com/photos/18225155/pexels-photo-18225155.jpeg?_gl=1*14wek22*_ga*MTY3MTYwNjg2OC4xNzcwNjM3ODU2*_ga_8JE65Q40S6*czE3NzA2NTAyNjAkbzQkZzEkdDE3NzA2NTIwNDYkajQ5JGwwJGgw",
  },
];

export const PhotoGallery: React.FC = () => {
  return (
    <section className="py-20 lg:py-32 bg-app-bg-primary">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-white text-app-accent-600 text-sm font-medium rounded-full mb-4 shadow-sm">
            Gallery
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-app-text-primary mb-4">
            Glimpses of the Tour
          </h2>
          <p className="text-lg text-app-text-secondary max-w-xl mx-auto">
            Get a preview of the stunning sights and landmarks you'll discover
            on our walking tour.
          </p>
        </div>

        {/* Photo Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className={`overflow-hidden rounded-2xl ${
                index === 0 ? "md:col-span-2 md:row-span-2" : ""
              }`}
            >
              <img
                src={photo.src}
                alt="Zurich tour highlight"
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
