"use client";

import { toast } from "react-hot-toast";
import axios from "axios";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { SafeReservation, SafeUser } from "@/app/types";
import Heading from "@/app/components/Heading";
import Container from "@/app/components/Container";
import ListingCard from "@/app/components/listings/ListingCard";

interface ReservationsClientProps {
  reservations: SafeReservation[];
  currentUser?: SafeUser | null;
}

const ReservationsClient: React.FC<ReservationsClientProps> = ({
  reservations,
  currentUser,
}) => {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState("");

  //function onCancel takes an id parameter and cancels a reservation with that ID
  //uses the useCallback hook to memoize the function and prevent unnecessary re-renders.
  const onCancel = useCallback(
    (id: string) => {
      //sets the deletingId state to the provided id, indicating that a deletion is in progress.
      setDeletingId(id);
      //sends a DELETE request to the /api/reservations endpoint with the given id.
      //If the request is successful, it shows a success message using the toast library, refreshes the page using the router.refresh() method, and clears the deletingId state.
      axios
        .delete(`/api/reservations/${id}`)
        .then(() => {
          toast.success("Reservation cancelled");
          router.refresh();
        })
        .catch(() => {
          toast.error("Something went wrong.");
        })
        .finally(() => {
          setDeletingId("");
        });
    },
    [router]
  );

  return (
    <Container>
      <Heading title="Reservations" subtitle="Bookings on your properties" />
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
        {reservations.map((reservation: any) => (
          <ListingCard
            key={reservation.id}
            data={reservation.listing}
            reservation={reservation}
            actionId={reservation.id}
            onAction={onCancel}
            disabled={deletingId === reservation.id}
            actionLabel="Cancel guest reservation"
            currentUser={currentUser}
          />
        ))}
      </div>
    </Container>
  );
};

export default ReservationsClient;
