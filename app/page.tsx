import getCurrentUser from "./actions/getCurrentUser";
import ClientOnly from "./components/ClientOnly";
import Container from "./components/Container";
import EmptyState from "./components/EmptyState";

// interface HomeProps {
//   searchParams: IListingsParams
// };

export default function Home() {
  // const listings = await getListings(searchParams);
  // const currentUser = await getCurrentUser();
  const isEmpty = true;

  if(isEmpty){
    return (
      <ClientOnly>
        <EmptyState showReset/>
      </ClientOnly>
    )
  }

  // if (listings.length === 0) {
  //   return (
  //     <ClientOnly>
  //       <EmptyState showReset />
  //     </ClientOnly>
  //   );
  // }
  return (
    <ClientOnly>
      <Container>
        <div className="pt-24 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
          Listings
          ))}
        </div>
      </Container>
    </ClientOnly>
  );
}
