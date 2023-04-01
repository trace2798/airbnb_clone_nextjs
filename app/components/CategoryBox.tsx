import React from "react";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { IconType } from "react-icons";
import qs from "query-string";

interface CategoryBoxProps {
  icon: IconType;
  label: string;
  selected?: boolean;
}

const CategoryBox: React.FC<CategoryBoxProps> = ({
  icon: Icon,
  label,
  selected,
}) => {
  const router = useRouter();
  const params = useSearchParams();

  // This defines a function named "handleClick" using the "useCallback" hook, which memoizes the function so that it only re-renders if its dependencies change
  const handleClick = useCallback(() => {
    // This initializes a "currentQuery" object
    let currentQuery = {};
    // This checks if the "params" object is defined (presumably from a URL search parameter) and parses it into an object using the "qs.parse" method
    if (params) {
      currentQuery = qs.parse(params.toString());
    }
    // This initializes an "updatedQuery" object by copying the "currentQuery" object and adding or removing the "category" key/value based on the "label" parameter
    const updatedQuery: any = {
      ...currentQuery,
      category: label,
    };
    //This check ensures that if the user clicks on a category box that is already selected, the "category" parameter is removed from the URL search parameters. This effectively clears the category filter and displays all items in the list
    if (params?.get("category") === label) {
      delete updatedQuery.category;
    }
    // This creates a URL string using the "qs.stringifyUrl" method with the updated query parameters and sets it as the new route using the "router.push" method
    const url = qs.stringifyUrl(
      {
        url: "/",
        query: updatedQuery,
      },
      { skipNull: true }
    );

    router.push(url);
  }, [label, router, params]);

  return (
    <div
      onClick={handleClick}
      className={`
      flex 
      flex-col 
      items-center 
      justify-center 
      gap-2
      p-3
      border-b-2
      hover:text-neutral-800
      transition
      cursor-pointer
      ${selected ? "border-b-neutral-800" : "border-transparent"}
      ${selected ? "text-neutral-800" : "text-neutral-500"}
    `}
    >
      <Icon size={26} />
      <div className="font-medium text-sm">{label}</div>
    </div>
  );
};

export default CategoryBox;
