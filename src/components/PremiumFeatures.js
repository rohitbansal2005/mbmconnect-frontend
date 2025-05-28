import React from 'react';

const PremiumFeatures = ({ user }) => {
    if (!user.isVerified) return null;

    const features = [
        {
            title: "Custom Themes",
            description: "Personalize your profile with custom color schemes and layouts",
            icon: "🎨"
        },
        {
            title: "Priority Support",
            description: "Get faster responses from our support team",
            icon: "⭐"
        },
        {
            title: "Advanced Analytics",
            description: "Detailed insights about your profile and post performance",
            icon: "📊"
        },
        {
            title: "Custom Badges",
            description: "Add custom badges to showcase your achievements",
            icon: "🏆"
        },
        {
            title: "Verified Badge",
            description: "Blue verification badge next to your name",
            icon: "✓"
        }
    ];

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mt-4">
            <h3 className="text-xl font-bold mb-4">Premium Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {features.map((feature, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="text-2xl mb-2">{feature.icon}</div>
                        <h4 className="font-semibold">{feature.title}</h4>
                        <p className="text-gray-600 text-sm">{feature.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PremiumFeatures; 