import React, { useState, useEffect, useRef } from 'react';
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CoachingInstituteWebsite() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-4 bg-white shadow">
        <h1 className="text-2xl font-bold">BrightPath Coaching</h1>
        <div className="space-x-6">
          <a href="#courses" className="hover:text-blue-600">Courses</a>
          <a href="#about" className="hover:text-blue-600">About</a>
          <a href="#contact" className="hover:text-blue-600">Contact</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-8 py-20 text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-bold mb-4">
          Empower Your Future with Expert Coaching
        </motion.h2>
        <p className="max-w-2xl mx-auto mb-6">
          Personalized coaching for school, college, and competitive exams.
        </p>
        <Button className="bg-white text-blue-600 hover:bg-gray-200">Enroll Now</Button>
      </section>

      {/* Courses Section */}
      <section id="courses" className="px-8 py-16">
        <h3 className="text-3xl font-semibold text-center mb-10">Our Courses</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {["School Coaching", "Competitive Exams", "Career Guidance"].map((course) => (
            <Card key={course} className="shadow-lg">
              <CardContent className="p-6">
                <h4 className="text-xl font-bold mb-2">{course}</h4>
                <p className="text-gray-600 mb-4">High-quality teaching with expert mentors.</p>
                <Button variant="outline">Learn More</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="px-8 py-16 bg-white">
        <h3 className="text-3xl font-semibold text-center mb-6">Why Choose Us?</h3>
        <p className="max-w-3xl mx-auto text-center text-gray-600">
          With experienced faculty, small batch sizes, and result-oriented teaching, BrightPath Coaching helps students achieve their academic goals.
        </p>
      </section>

      {/* Contact Section */}
      <section id="contact" className="px-8 py-16 bg-gray-100">
        <h3 className="text-3xl font-semibold text-center mb-6">Contact Us</h3>
        <div className="max-w-xl mx-auto text-center">
          <p className="mb-4">📍 City Center, Your City</p>
          <p className="mb-4">📞 +91 98765 43210</p>
          <p className="mb-6">✉️ info@brightpathcoaching.com</p>
          <Button>Get in Touch</Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center bg-white shadow-inner">
        <p className="text-sm text-gray-500">© 2026 BrightPath Coaching Institute. All rights reserved.</p>
      </footer>
    </div>
  );
}
