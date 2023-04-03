"use client";
import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { Range } from "react-date-range";
import { useRouter } from "next/navigation";
import { differenceInDays, eachDayOfInterval } from "date-fns";

import useLoginModal from "@/app/hooks/useLoginModal";
import { SafeListing, SafeReservation, SafeUser } from "@/app/types";

import Container from "@/app/components/Container";
import { categories } from "@/app/components/navbar/Categories";
import ListingHead from "@/app/components/listings/ListingHead";
import ListingInfo from "@/app/components/listings/ListingInfo";
import ListingReservation from "@/app/components/listings/ListingReservation";

const initialDateRange = {
  startDate: new Date(),
  endDate: new Date(),
  key: "selection",
};

interface ListingClientProps {
  reservations?: SafeReservation[];
  listing: SafeListing & {
    user: SafeUser;
  };
  currentUser?: SafeUser | null;
}

const ListingClient: React.FC<ListingClientProps> = ({
  listing,
  reservations = [], //giving an empty array so that we can run .map .find etc without any error.
  currentUser,
}) => {
  const loginModal = useLoginModal();
  const router = useRouter();

  //useMemo hook to memoize the disabledDates value.
  //disabledDates value is an array of dates that should be disabled in the date picker component to prevent users from selecting dates that are already reserved.
  const disabledDates = useMemo(() => {
    //initializes an empty array for the dates variable
    let dates: Date[] = [];
    //loops over each reservation in the reservations array and creates a date range using the eachDayOfInterval function from the date-fns library. The resulting range is then spread into the dates array.
    reservations.forEach((reservation: any) => {
      const range = eachDayOfInterval({
        start: new Date(reservation.startDate),
        end: new Date(reservation.endDate),
      });
      dates = [...dates, ...range];
    });
    //dates array is returned as the disabledDates value
    return dates;
    // The reservations array is a dependency of the useMemo hook, so the disabledDates value will be recomputed whenever the reservations array changes.
  }, [reservations]);

  // uses the useMemo hook to memoize the result of finding a category object from an array of categories based on a value of listing.category.
  //the function passed to useMemo uses the find method to search for an object in the categories array that has a label property matching the category property of the listing object.
  //This function will only be executed again if listing.category changes. Once the function is executed, the result is memoized and returned.
  const category = useMemo(() => {
    return categories.find((items) => items.label === listing.category);
  }, [listing.category]);

  const [isLoading, setIsLoading] = useState(false);
  const [totalPrice, setTotalPrice] = useState(listing.price);
  //The type of dateRange is inferred based on the type of initialDateRange
  const [dateRange, setDateRange] = useState<Range>(initialDateRange);

  //onCreateReservation that uses useCallback hook to memoize the function, and it's used to create a new reservation for a listing.
  const onCreateReservation = useCallback(() => {
    //if user is not logged in it opens the loginModal.
    if (!currentUser) {
      return loginModal.onOpen();
    }
    setIsLoading(true);
    //sends a POST request to the /api/reservations endpoint with the total price, start date, end date, and listing ID as the payload
    axios
      .post("/api/reservations", {
        totalPrice,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        listingId: listing?.id,
      })
      //If the request is successful, it shows a success toast and redirects the user to the /trips page.
      .then(() => {
        toast.success("Listing reserved!");
        setDateRange(initialDateRange);
        // router.push("/trips");
      })
      .catch(() => {
        toast.error("Something went wrong.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [totalPrice, dateRange, listing?.id, router, currentUser, loginModal]);

  //useEffect hook is used to perform side effects in response to changes in dependencies, which are specified in the array passed as the second argument.
  // the effect is triggered whenever there is a change in the dateRange or listing.price values.
  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      //The effect calculates the number of days between the startDate and endDate values of the dateRange object using the differenceInDays function from the date-fns library.
      const dayCount = differenceInDays(dateRange.endDate, dateRange.startDate);
      // If the day count and the price value of the listing object are both defined, the effect calculates the totalPrice by multiplying the day count by the price
      if (dayCount && listing.price) {
        setTotalPrice(dayCount * listing.price);
      } else {
        //otherwise it sets the totalPrice to the price value of the listing.
        setTotalPrice(listing.price);
      }
    }
  }, [dateRange, listing.price]);

  return (
    <Container>
      <div className="max-w-screen-lg mx-auto">
        <div className="flex flex-col gap-6">
          <ListingHead
            title={listing.title}
            imageSrc={listing.imageSrc}
            locationValue={listing.locationValue}
            id={listing.id}
            currentUser={currentUser}
          />
          <div className="grid grid-cols-1 md:grid-cols-7 md:gap-10 mt-6">
            <ListingInfo
              user={listing.user}
              category={category}
              description={listing.description}
              roomCount={listing.roomCount}
              guestCount={listing.guestCount}
              bathroomCount={listing.bathroomCount}
              locationValue={listing.locationValue}
            />
            <div className="order-first mb-10 md:order-last md:col-span-3">
              <ListingReservation
                price={listing.price}
                totalPrice={totalPrice}
                onChangeDate={(value) => setDateRange(value)}
                dateRange={dateRange}
                onSubmit={onCreateReservation}
                disabled={isLoading}
                disabledDates={disabledDates}
              />
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};
export default ListingClient;
