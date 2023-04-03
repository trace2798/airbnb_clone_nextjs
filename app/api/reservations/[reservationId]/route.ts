import { NextResponse } from "next/server";

import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";

interface IParams {
  reservationId?: string;
}
//exports a DELETE function which is a request handler for deleting a reservation with the given reservation ID
//DELETE function takes two arguments: request and { params } object which is destructured to get reservationId.
export async function DELETE(
  request: Request,
  { params }: { params: IParams }
) {
  //The function first checks if there is a currently logged-in user by calling the getCurrentUser function
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.error();
  }

  const { reservationId } = params;
  // function then checks if the reservationId is a valid string, and throws an error if it is not
  if (!reservationId || typeof reservationId !== "string") {
    throw new Error("Invalid ID");
  }
  // the  function then deletes the reservation from the prisma client by calling the prisma.reservation.deleteMany() function.
  // The function deletes the reservation that matches the given reservation ID and where the user ID matches the ID of the currently logged-in user or the listing ID matches the ID of the currently logged-in user
  const reservation = await prisma.reservation.deleteMany({
    where: {
      id: reservationId,
      //only people who can cancel the reservation is the owner of the place or the user who made the reservation.
      OR: [{ userId: currentUser.id }, { listing: { userId: currentUser.id } }],
    },
  });

  return NextResponse.json(reservation);
}
