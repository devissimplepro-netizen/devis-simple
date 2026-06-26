'use client';

import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Jean-Pierre Martin',
    role: 'Plombier à Lyon',
    image: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=150',
    content: 'Avant je passais des heures à faire mes devis. Maintenant, c\'est réglé en quelques secondes. Mes clients sont impressionnés par le professionnalisme.',
    rating: 5,
  },
  {
    name: 'Marie Dupont',
    role: 'Électricienne à Paris',
    image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
    content: 'La signature en ligne a transformé mon entreprise. Plus besoin de repasser chez les clients pour faire signer les devis. Tout se fait en ligne !',
    rating: 5,
  },
  {
    name: 'Philippe Bernard',
    role: 'Entrepreneur en rénovation',
    image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
    content: 'L\'IA vocale est un vrai game-changer. Je dicte mes devis en conduisant entre deux chantiers. Gagne un temps fou !',
    rating: 5,
  },
  {
    name: 'Sophie Laurent',
    role: 'Architecte d\'intérieur',
    image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
    content: 'Les PDF sont super professionnels. J\'ai choisi le modèle premium avec mes couleurs. Mes clients adorent le rendu.',
    rating: 5,
  },
  {
    name: 'Michel Rousseau',
    role: 'Climaticien à Bordeaux',
    image: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150',
    content: 'Je transforme mes devis en factures en un clic. Plus besoin de double saisie. Le système gère tout automatiquement.',
    rating: 5,
  },
  {
    name: 'Nathalie Petit',
    role: 'Paysagiste',
    image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150',
    content: 'Le tableau de bord me permet de voir d\'un coup d\'oeil où j\'en suis. Taux d\'acceptation, CA, le tout en temps réel.',
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Ils nous font confiance
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Plus de 2 500 artisans utilisent Devis Simple au quotidien.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>

              <p className="text-gray-600 mb-6 leading-relaxed">
                &quot;{testimonial.content}&quot;
              </p>

              <div className="flex items-center gap-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
