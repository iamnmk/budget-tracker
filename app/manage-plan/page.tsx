function ManagePlan() {
  return (
    <div className="container xl:max-w-5xl mx-auto p-4 md:p-0">
      <h1 className="text-2xl font-bold mb-4 my-8">Manage Your Plan</h1>
      <p className="text-gray-600 mb-8">
        Manage your subscription and billing details here.
      </p>

      <div className="border rounded-lg p-8 text-center bg-gray-50">
        <h2 className="text-xl font-semibold mb-4">Subscription Management</h2>
        <p className="text-gray-600 mb-6">
          Subscription management has been simplified. All features are now available without requiring a paid plan.
        </p>
        <a 
          href="/receipts" 
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 inline-block"
        >
          Back to Receipts
        </a>
      </div>
    </div>
  );
}

export default ManagePlan;
