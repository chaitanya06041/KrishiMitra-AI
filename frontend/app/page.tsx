'use client'; // if using Next.js app directory

import React, { useState } from "react";

const Page = () => {
  const [selectedImage, setSelectedImage] = useState(null);

  const handleFileChange = (e) => {
    setSelectedImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload

    if (!selectedImage) {
      alert("Please select an image before submitting.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedImage); // Make sure backend expects 'image'

    try {
      const response = await fetch('http://localhost:8000/disease-prediction', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      console.log("Prediction:", result);
      alert(`Prediction: ${result.prediction}`);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Error uploading image.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen flex-col bg-gray-100">
      <form
        className="flex flex-col items-center gap-4 p-6 bg-white shadow-md rounded text-gray-800"
        onSubmit={handleSubmit}
      >
        <label className="text-lg font-semibold">Upload an Image</label>

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="file-input file-input-bordered file-input-sm w-full max-w-xs"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default Page;
