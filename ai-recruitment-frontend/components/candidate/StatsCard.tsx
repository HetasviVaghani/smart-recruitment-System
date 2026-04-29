export default function StatsCard({ title, value }: any) {
  return (
    <div className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition">

      <h3 className="text-gray-500">{title}</h3>

      <p className="text-2xl font-bold mt-2">
        {value}
      </p>

    </div>
  );
}