"use client";

//interface called ContainerProps. The interface has only one property - children - which is a React node that can be rendered as a child element.
interface ContainerProps {
  children: React.ReactNode;
}
//creates a functional component called Container that renders a div and any children passed to it. The component takes a single prop, children, which is of type ReactNode and is provided by the ContainerProps interface.
//The React.FC type indicates that the component is a function component.
const Container: React.FC<ContainerProps> = ({ children }) => {
  return <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4">{children}</div>;
};

export default Container;
