import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import { toast } from 'react-toastify';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const PaymentForm = ({ onSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        try {
            // Create payment intent
            const { data: { clientSecret, paymentId } } = await axios.post('/api/payment/create-verification-payment');

            // Confirm payment
            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                }
            });

            if (error) {
                toast.error(error.message);
            } else if (paymentIntent.status === 'succeeded') {
                // Verify payment on backend
                await axios.post('/api/payment/verify-payment', { paymentId });
                toast.success('Payment successful! Your account is now verified.');
                onSuccess();
            }
        } catch (error) {
            toast.error('Payment failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center">Get Verified</h2>
            <p className="text-gray-600 mb-6 text-center">
                Get a blue verification badge for ₹100
            </p>
            
            <div className="mb-6">
                <CardElement
                    options={{
                        style: {
                            base: {
                                fontSize: '16px',
                                color: '#424770',
                                '::placeholder': {
                                    color: '#aab7c4',
                                },
                            },
                            invalid: {
                                color: '#9e2146',
                            },
                        },
                    }}
                />
            </div>

            <button
                type="submit"
                disabled={!stripe || loading}
                className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                    loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
                {loading ? 'Processing...' : 'Pay ₹100'}
            </button>
        </form>
    );
};

const VerificationPayment = ({ onSuccess }) => {
    const [price, setPrice] = useState(null);

    useEffect(() => {
        const fetchPrice = async () => {
            try {
                const { data } = await axios.get('/api/payment/verification-price');
                setPrice(data.price);
            } catch (error) {
                console.error('Error fetching price:', error);
            }
        };
        fetchPrice();
    }, []);

    if (!price) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <Elements stripe={stripePromise}>
                    <PaymentForm onSuccess={onSuccess} />
                </Elements>
            </div>
        </div>
    );
};

export default VerificationPayment; 