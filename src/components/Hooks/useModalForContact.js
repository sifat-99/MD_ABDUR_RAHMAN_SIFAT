"use client";
import React, { useState } from "react";
import "@/styles/Modal.module.css";
import toast, { Toaster } from "react-hot-toast";
import { IoCloseCircleOutline } from "react-icons/io5";
import { MdOutlineAddIcCall } from "react-icons/md";
import { sendContactForm } from "../../../lib/api";
import Spinner from "../Spinner";

const useModalForContact = () => {
  const [loading, setLoading] = useState(false);

  const handleContact = async (e) => {
    setLoading(true);
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      subject: formData.get("subject"),
      message: formData.get("message"),
    };

    await sendContactForm(data).then((res) => {
      // console.log(res);
      if (res.status === 200) {
        toast.success("Message sent successfully.", {
          style: {
            border: "1px solid black",
            padding: "16px",
            backgroundColor: "#0A1D56",
            fontSize: "1rem",
            color: "#fff",
            fontWeight: "bold",
          },
        });
        setLoading(false);
        form.reset();
        document.getElementById("my_modal_5").close();
      }
    });
  };

  return (
    <>
      <Toaster />
      <button
        className="ml-4 bg-dark flex gap-2 items-center p-2.5 text-light px-5 rounded-lg text-lg font-semibold hover:bg-light hover:text-dark transition-all border-2 border-solid border-transparent hover:border-dark dark:bg-light dark:text-dark hover:dark:bg-dark hover:dark:text-light hover:dark:border-light md:p-2 md:px-4 md:text-base"
        onClick={() => document.getElementById("my_modal_5").showModal()}
      >
        Contact <MdOutlineAddIcCall />
      </button>
      <dialog id="my_modal_5" className="rounded-lg w-96">
        <div className="flex items-center justify-center  bg-gradient-to-r from-[#b9b4e9] via-[#b191f1] to-[#f1a5fd] dark:bg-gradient-to-r dark:from-[#191919] dark:via-[#040304] dark:to-[#000000] ">
          <div className=" dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-12 w-full">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              Contact Me
            </h2>
            <div className="mt-4">
              <form onSubmit={handleContact} className="flex flex-col gap-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  required
                  className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg"
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  name="email"
                  required
                  className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Subject"
                  name="subject"
                  required
                  className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg"
                />
                <textarea
                  name="message"
                  required
                  placeholder="Your Message"
                  className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg transition-all"
                ></textarea>
                {!loading ? (
                  <button
                    type="submit"
                    class="w-full block bg-purple-500 hover:bg-purple-700 focus:bg-indigo-400 text-white font-bold rounded-lg
              px-4 py-3 mt-6 transition-colors"
                  >
                    Send Message
                  </button>
                ) : (
                  <Spinner /> 
                )}
              </form>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => document.getElementById("my_modal_5").close()}
                className="absolute top-2 text-xl right-2 text-gray-800 dark:text-white p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-purple-700 hover:text-white transition-all dark:hover:bg-purple-700 dark:hover:text-white dark:hover:bg-opacity-80 dark:bg-opacity-80 hover:bg-opacity-80 bg-opacity-80"
              >
                <IoCloseCircleOutline />
              </button>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
};

export default useModalForContact;
