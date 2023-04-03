import prisma from "@/app/libs/prismadb";

interface IParams {
  listingId?: string;
  userId?: string;
  authorId?: string;
}

export default async function getReservations(params: IParams) {
  try {
    //extracting the properties from params
    const { listingId, userId, authorId } = params;
    // initializing an empty query object
    // It then adds a property to query based on the given parameter if it is defined
    const query: any = {};
    //If listingId is defined, it is used as a filter on the listingId property of reservations
    if (listingId) {
      query.listingId = listingId;
    }

    if (userId) {
      query.userId = userId;
    }

    if (authorId) {
      query.listing = { userId: authorId };
    }
    // function makes a Prisma query to retrieve reservations based on the constructed query
    //The query includes the listing object in each reservation and orders the results by the createdAt property of reservations in descending order.
    const reservations = await prisma.reservation.findMany({
      where: query,
      include: {
        listing: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    //the function maps over the retrieved reservations and returns a new array of "safe" reservations
    //in safeReservation certain properties are converted to ISO date strings to avoid any potential issues with date formatting.
    const safeReservations = reservations.map((reservation) => ({
      ...reservation,
      createdAt: reservation.createdAt.toISOString(),
      startDate: reservation.startDate.toISOString(),
      endDate: reservation.endDate.toISOString(),
      listing: {
        ...reservation.listing,
        createdAt: reservation.listing.createdAt.toISOString(),
      },
    }));

    return safeReservations;
  } catch (error: any) {
    throw new Error(error);
  }
}