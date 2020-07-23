import fetch from "isomorphic-unfetch";

import useSwr from "swr";
const fetcher = url => fetch(url).then(res => res.json());

function BookPage() {
  const { data, error } = useSwr("/api/view", fetcher);
  console.log("data", data);
  console.log("error", error);
  if (error) return <div>Failed to load users</div>;
  if (!data) return <div>Loading...</div>;

  // console.log(JSON.parse(JSON.stringify(data.html)));

  return (
    <iframe srcDoc={data.html}> </iframe>
    // <div
    //   dangerouslySetInnerHTML={{
    //     __html: JSON.parse(JSON.stringify(data.html))
    //   }}
    // ></div>
  );
}

// BookPage.getInitialProps = async ctx => {
//   const res = await fetch("../api/view");
//   const hey = await res; //.json(); // .json();
//   console.log("hello", hey);

//   console.log("CONTEXT", ctx);
//   //const json = await res.json();
//   return { hey: hey };
// };

export default BookPage;

// import React from "react";
// // import WebpubViewer from "../../components/WebpubViewer";

// // const BookPage = () => {
// //   return <WebpubViewer />;
// // };

// import useSWR from "swr";
// //import Person from "../components/Person";

// const fetcher = url => fetch(url).then(res => res.json());

// export default function BookPage() {
//   const { data, error } = useSWR("/api/view", fetcher);
//   console.log("error", error);
//   console.log("data", data);
//   if (error) return <div>Failed to load </div>;
//   if (!data) return <div>Loading...</div>;

//   return console.log(data);
//   // <ul>
//   //   {data.map((p, i) => (
//   //     <Person key={i} person={p} />
//   //   ))}
//   // </ul>
// }

// // export default BookPage;
