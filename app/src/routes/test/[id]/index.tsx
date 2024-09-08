import { A, useParams } from '@solidjs/router';

export default function Test() {
  const { id } = useParams();
  return (
    <>
      <h1>{id}</h1>
      <p>
        <A href="/">HOME</A>
      </p>
    </>
  );
}
