<?php

return [
    'plans' => [
        'free' => [
            'name' => 'Free',
            'headline' => 'Default plan for new users.',
            'price' => '$0',
            'price_suffix' => '/month',
            'description' => 'Every creation workflow is limited to 10 items until the user upgrades.',
            'stripe_price_id' => null,
            'highlighted' => false,
            'features' => [
                'Up to 10 jobs',
                'Up to 10 resumes',
                'Up to 10 analytics results',
                'Up to 10 cover letters',
                'Up to 10 interview prep sessions',
                'Up to 10 online exams',
            ],
        ],
        'pro' => [
            'name' => 'PRO',
            'headline' => 'Recurring monthly billing through Stripe Checkout.',
            'price' => '$' . (env('STRIPE_PRICE_PRO_AMOUNT', 2900) / 100), 
            'price_suffix' => '/month',
            'description' => 'The only paid plan. Users subscribe to PRO and manage billing from the Stripe billing portal.',
            'stripe_price_id' => env('STRIPE_PRICE_PRO_MONTHLY'),
            'highlighted' => true,
            'features' => [
                'Unlimited creation across all product modules',
                'Stripe Checkout purchase flow',
                'Stripe billing portal for invoices, payment methods, and cancellation',
            ],
        ],
    ],
];
