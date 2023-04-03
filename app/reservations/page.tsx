import EmptyState from "@/app/components/EmptyState";
import ClientOnly from "@/app/components/ClientOnly";

import getCurrentUser from "@/app/actions/getCurrentUser";
import getReservations from "@/app/actions/getReservations";

import TripsClient from "./ReservationsClient";

const ReservationsPage = async () => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return (
      <ClientOnly>
        <EmptyState title="Unauthorized" subtitle="Please login" />
      </ClientOnly>
    );
  }
  //If there is a logged in user, it calls getReservations() to get a list of reservations for properties owned by the logged in user.
  //we pass authorId because we want to load all the reservations on our listings, i.e. all the reservation other people has made on our listings. 
  const reservations = await getReservations({ authorId: currentUser.id });

  if (reservations.length === 0) {
    return (
      <ClientOnly>
        <EmptyState
          title="No reservations found"
          subtitle="Looks like you have no reservations on your properties."
        />
      </ClientOnly>
    );
  }

  return (
    //If there are reservations for the logged in user, it renders a TripsClient component passing in the reservations and the currently logged in user.
    <ClientOnly>
      <TripsClient reservations={reservations} currentUser={currentUser} />
    </ClientOnly>
  );
};

export default ReservationsPage;
