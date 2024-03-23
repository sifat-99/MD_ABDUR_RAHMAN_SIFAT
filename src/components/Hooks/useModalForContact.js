"use client";
import React, { useState } from "react";
import "@/styles/Modal.module.css";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { IoCloseCircleOutline } from "react-icons/io5";
import { MdOutlineAddIcCall } from "react-icons/md";

const useModalForContact = () => {
  const handleContact = (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
    };
    console.log(data);
    Swal.fire({
      position: "top-end",
      icon: "success",
      title: "Your message has been sent successfully",
      showConfirmButton: true,
      timer: 1500,
    }).then(() => {
      form.reset();
      document.getElementById("my_modal_5").close();
    });
  };

  return (
    <>
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
                  className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg"
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  name="email"
                  className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg"
                />
                <textarea
                  name="message"
                  placeholder="Your Message"
                  className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg"
                ></textarea>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg"
                >
                  Send
                </button>
              </form>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => document.getElementById("my_modal_5").close()}
                className="absolute top-2 text-xl right-2 text-gray-800 dark:text-gray-200 p-2 rounded-lg bg-gray-200 dark:bg-gray-700"
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
