import fetch from "isomorphic-unfetch";

import useSwr from "swr";
const fetcher = url => fetch(url).then(res => res.json());

export default function BookPage() {
  const { data, error } = useSwr("/api/view", fetcher);

  console.log(data);

  if (error) return <div>Failed to load book</div>;
  if (!data) return <div>Loading...</div>;

  return <iframe srcDoc={data.html}> </iframe>;
}
