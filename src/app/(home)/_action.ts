"use server";

export const joinWaitlist = async (state: unknown, formData: FormData) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log("User joined waitlist", state, formData);

  return {
    error: "The waitlist is currently full. Please try again later.",
  };
};
