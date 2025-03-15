export default async function Greet() {
    console.log("Greet component rendered");
  return (
    <div className="p-4 bg-blue-100 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-blue-800">
        Welcome to Our Application!
      </h1>
      <p className="mt-2 text-blue-600">
        We're glad you're here. This is a server component that displays a greeting message.
      </p>
    </div>
  );
}
