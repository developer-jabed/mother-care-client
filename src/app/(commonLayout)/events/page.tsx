import React from 'react';


export const dynamic = "force-dynamic";


const page = () => {
    return (
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
            <h1 className="text-3xl font-bold text-gray-800">ইভেন্ট (Events)</h1>
            <p className="max-w-md text-gray-500">
                এই পেজটি বর্তমানে ডেভেলপমেন্ট পর্যায়ে রয়েছে। শীঘ্রই এখানে স্কুলের সকল ইভেন্ট, অনুষ্ঠান এবং কার্যক্রমের তথ্য যুক্ত করা হবে।
            </p>
            <span className="rounded-full bg-yellow-100 px-4 py-1 text-sm font-medium text-yellow-800">
                🚧 Coming Soon
            </span>
        </div>
    );
};

export default page;