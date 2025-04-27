"use client";

const testimonials = [
  { name: "Andrew", text: "This is the best AI tool I have ever used!" },
  {
    name: "John",
    text: "I love how easy it is to create content with this tool!",
  },
  { name: "Jane", text: "The AI technology is amazing!" },

  { name: "Sarah", text: "I can't believe how fast it works!" },
  { name: "Michael", text: "The customer support is top-notch!" },
  { name: "Emily", text: "I highly recommend this tool to everyone!" },
  { name: "David", text: "It's a game changer for content creation!" },
  { name: "Sophia", text: "I love the user-friendly interface!" },
  { name: "Daniel", text: "The AI-generated content is impressive!" },
  { name: "Olivia", text: "This tool has saved me so much time!" },
];

const LandingContent = () => {
  return (
    <div className="px-10 pb-20 ">
      <h2 className="text-center text-4xl text-white font-extrabold mb-10 "></h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-lg p-5 m-2 text-center"
          >
            <p className="text-gray-700 font-semibold">{testimonial.name}</p>
            <p className="text-gray-500">{testimonial.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LandingContent;
