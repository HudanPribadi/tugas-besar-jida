import Link from "next/link";

export default function SecurePage() {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <p>Anda tidak bisa masuk ke halaman ini</p>
      <Link href="/">Beranda</Link>
    </div>
  );
}
