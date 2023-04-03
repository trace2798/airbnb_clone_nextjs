import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.error();
  }
  // Parse the request body
  const body = await request.json();
  // Extract the listing ID, start date, end date, and total price from the body
  const { listingId, startDate, endDate, totalPrice } = body;

  // If any of the required fields are missing, return an error response
  if (!listingId || !startDate || !endDate || !totalPrice) {
    NextResponse.error();
  }

  // Update the listing in the database to create a new reservation
  const listingAndReservation = await prisma.listing.update({
    where: {
      id: listingId,
    },
    data: {
      reservations: {
        create: {
          userId: currentUser.id,
          startDate,
          endDate,
          totalPrice,
        },
      },
    },
  });
  // Return a JSON response containing the updated listing and reservation
  return NextResponse.json(listingAndReservation);
}
