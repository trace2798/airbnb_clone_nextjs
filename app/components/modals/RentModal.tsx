"use client";

import React, { useMemo, useState } from "react";
import Modal from "./Modal";
import useRentModal from "@/app/hooks/useRentModal";
import Heading from "../Heading";
import { categories } from "../navbar/Categories";
import CategoryInput from "../inputs/CategoryInput";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import CountrySelect from "../inputs/CountrySelect";
import dynamic from "next/dynamic";
import Counter from "../inputs/Counter";
import ImageUpload from "../inputs/ImageUpload";
import Input from "../inputs/Input";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

// enum can be used to represent a sequence of steps in a form or a wizard. By assigning a numeric value to each step, the code can easily keep track of the current step and navigate to the next or previous step
enum STEPS {
  CATEGORY = 0,
  LOCATION = 1,
  INFO = 2,
  IMAGES = 3,
  DESCRIPTION = 4,
  PRICE = 5,
}

const RentModal = () => {
  const rentModal = useRentModal();

  // By setting the initial value of step to STEPS.CATEGORY, the code is indicating that the form should start at the first step (i.e., the "category" step).
  // When the setStep function is called, React will automatically re-render the component to reflect the updated state.
  const [step, setStep] = useState(STEPS.CATEGORY);

  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  //declares several variables using destructuring assignment from the return value of the useForm hook provided by the react-hook-form library
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<FieldValues>({
    defaultValues: {
      category: "",
      location: null,
      guestCount: 1,
      roomCount: 1,
      bathroomCount: 1,
      imageSrc: "",
      price: 1,
      title: "",
      description: "",
    },
  });

  //watch: a function that monitors changes to specific form fields and returns their current values. This function is typically used to trigger updates or validation based on user input.
  const category = watch("category");
  const location = watch("location");
  const guestCount = watch("guestCount");
  const roomCount = watch("roomCount");
  const bathroomCount = watch("bathroomCount");
  const imageSrc = watch("imageSrc");

  //useMemo is a hook provided by React that allows you to memoize a value (i.e. store a cached version of a value) and only recalculate it when one of its dependencies changes.
  //the value being memoized is a dynamically loaded version of the Map component from the ../Map file, which is loaded asynchronously using the dynamic function from the next/dynamic package.
  const Map = useMemo(
    () =>
      dynamic(() => import("../Map"), {
        // The ssr option is set to false to prevent the component from being rendered on the server side.
        ssr: false,
      }),
    //The dependency array includes a single value, location, which means that the Map component will be reloaded whenever the location value changes. This ensures that the component always displays the correct location on the map.
    [location]
  );

  //defines a function setCustomValue that can be used to programmatically set the value of a form input using the setValue function provided by the react-hook-form library. Takes two arguments id and value.
  const setCustomValue = (id: string, value: any) => {
    setValue(id, value, {
      //shouldDirty: a boolean indicating whether the input should be marked as "dirty" after its value is updated. A "dirty" input is one that has been modified by the user.
      shouldDirty: true,
      //shouldTouch: a boolean indicating whether the input should be marked as "touched" after its value is updated. A "touched" input is one that has been focused and then blurred by the user.
      shouldTouch: true,
      //shouldValidate: a boolean indicating whether the input should be re-validated after its value is updated. This option is typically set to true to ensure that the form remains in a valid state.
      shouldValidate: true,
    });
  };

  //Both functions use the functional form of setStep, which takes the current state value as an argument and returns a new value based on that state.
  //onBack function is use to go to the previous step. The function takes the current value of step as an argument and returns a new value that is one less than the current value.
  const onBack = () => {
    setStep((value) => value - 1);
  };

  //onNext function is used to go to the next step. The function takes the current value of step as an argument and returns a new value that is one more than the current value.
  const onNext = () => {
    setStep((value) => value + 1);
  };

  //onSubmit function serves as the callback function for when the user submits the form.
  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    //If the current form step is STEPS.PRICE, the function sets the isLoading state to true, indicating that a network request is in progress.
    if (step !== STEPS.PRICE) {
      return onNext();
    }
    setIsLoading(true);
    //If the POST request is successful, the function displays a success message
    axios
      //makes a POST request to the /api/listings endpoint with the form data as the payload.
      .post("/api/listings", data)
      .then(() => {
        //POST request is successful, the function displays a success message
        toast.success("Listing created!");
        //router.refresh() is a custom method used to refresh the current page. (It can be useful in situations where you want to refresh the page's content without navigating to a different page.)
        router.refresh();
        //resets the form with the reset function from react-hook-form
        reset();
        // sets the form step back to STEPS.CATEGORY
        setStep(STEPS.CATEGORY);
        // closes the modal window
        rentModal.onClose();
      })
      .catch(() => {
        //If the POST request fails, the function displays an error message to the user using the toast.error function.
        toast.error("Something went wrong.");
      })
      //regardless of whether the POST request succeeds or fails, the function sets the isLoading state back to false, indicating that the network request has completed.
      .finally(() => {
        setIsLoading(false);
      });
  };

  //The function passed to useMemo in this code checks the value of the step variable and returns either the string 'Create' or 'Next', depending on whether step is equal to STEPS.PRICE or not.
  //If step is equal to STEPS.PRICE, then the variable actionLabel will be set to 'Create'. Otherwise, it will be set to 'Next'.
  const actionLabel = useMemo(() => {
    if (step === STEPS.PRICE) {
      return "Create";
    }
    return "Next";
    //By including [step] as a dependency array, the useMemo hook ensures that the function is re-run and the actionLabel variable is re-calculated only when the value of step changes.
  }, [step]);

  //If the current value of the step state variable is equal to the STEPS.CATEGORY enum value the function returns undefined.
  //If the step value is not equal to STEPS.CATEGORY, this line returns the string 'Back'
  const secondaryActionLabel = useMemo(() => {
    if (step === STEPS.CATEGORY) {
      return undefined;
    }
    return "Back";
  }, [step]);

  //body content will be dynamic depending on the step we are on. So we will use let.
  let bodyContent = (
    <div className="flex flex-col gap-8">
      <Heading
        title="Which of these best describes your place?"
        subtitle="Pick a category"
      />
      <div
        className="
          grid 
          grid-cols-1 
          md:grid-cols-2 
          gap-3
          max-h-[50vh]
          overflow-y-auto
        "
      >
        {/* we want to reuse the categories data so we import {categories} */}
        {categories.map((item) => (
          <div key={item.label} className="col-span-1">
            <CategoryInput
              onClick={(category) => setCustomValue("category", category)}
              selected={category === item.label}
              label={item.label}
              icon={item.icon}
            />
          </div>
        ))}
      </div>
    </div>
  );

  if (step === STEPS.LOCATION) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title="Where is your place located?"
          subtitle="Help guests find you!"
        />
        <CountrySelect
          value={location}
          onChange={(value) => setCustomValue("location", value)}
        />
        {/* Map needs to be imported in a specific way since it is not supported in react. So we need to do some acrobatics.  */}
        <Map center={location?.latlng} />
      </div>
    );
  }

  if (step === STEPS.INFO) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title="Share some basics about your place"
          subtitle="What amenities do you have?"
        />
        <Counter
          onChange={(value) => setCustomValue("guestCount", value)}
          value={guestCount}
          title="Guests"
          subtitle="How many guests do you allow?"
        />
        <hr />
        <Counter
          onChange={(value) => setCustomValue("roomCount", value)}
          value={roomCount}
          title="Rooms"
          subtitle="How many rooms do you have?"
        />
        <hr />
        <Counter
          onChange={(value) => setCustomValue("bathroomCount", value)}
          value={bathroomCount}
          title="Bathrooms"
          subtitle="How many bathrooms do you have?"
        />
      </div>
    );
  }

  if (step === STEPS.IMAGES) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title="Add a photo of your place"
          subtitle="Show guests what your place looks like!"
        />
        <ImageUpload
          onChange={(value) => setCustomValue("imageSrc", value)}
          value={imageSrc}
        />
      </div>
    );
  }

  if (step === STEPS.DESCRIPTION) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title="How would you describe your place?"
          subtitle="A brief description of your place"
        />
        <Input
          id="title"
          label="Title"
          disabled={isLoading}
          register={register}
          errors={errors}
          required
        />
        <hr />
        <Input
          id="description"
          label="Description"
          disabled={isLoading}
          register={register}
          errors={errors}
          required
        />
      </div>
    );
  }

  if (step === STEPS.PRICE) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title="Now, set your price"
          subtitle="How much do you charge per night?"
        />
        <Input
          id="price"
          label="Price"
          formatPrice
          type="number"
          disabled={isLoading}
          register={register}
          errors={errors}
          required
        />
      </div>
    );
  }

  return (
    <Modal
      isOpen={rentModal.isOpen}
      onClose={rentModal.onClose}
      onSubmit={handleSubmit(onSubmit)}
      actionLabel={actionLabel}
      secondaryActionLabel={secondaryActionLabel}
      secondaryAction={step === STEPS.CATEGORY ? undefined : onBack}
      title="Airbnb your home!"
      body={bodyContent}
    />
  );
};

export default RentModal;
