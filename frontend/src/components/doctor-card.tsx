import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { Doctor } from '@/types/doctor';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { postData } from '@/lib/api';

export function DoctorCard({ doctor }: { doctor: Doctor }) {
  // Doctor window
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  function handleSend() {
    const data = {
      patientId: '1AA1',
      doctorId: '2BB2',
    };

    postData('/api/v1/subscriptions/request', data).then((res) => {
      console.log(res);
    });
  }

  return (
    <>
      <div
        onClick={handleOpen}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') handleOpen();
        }}
        tabIndex={0}
        role="button"
        className="cursor-pointer focus:outline-none hover:scale-[1.02] transition-transform"
      >
        <Card>
          <CardHeader>
            <div className="font-semibold text-lg">{doctor.name}</div>
            <div className="text-sm text-gray-500">{doctor.specialty}</div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-700 space-y-1">
              <div>Email: {doctor.email}</div>
              <div>Phone: {doctor.phone}</div>
              <div>Experience: {doctor.experience} years</div>
              <div>Rating: {doctor.rating}</div>
              <div className="text-gray-600">{doctor.bio}</div>
              <div className="text-gray-500">
                Availability: {doctor.availability}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{doctor.name}</DialogTitle>
            <DialogDescription>{doctor.specialty}</DialogDescription>
          </DialogHeader>

          <div className="space-y-2 text-sm">
            <p>
              <strong>Email:</strong> {doctor.email}
            </p>
            <p>
              <strong>Phone:</strong> {doctor.phone}
            </p>
            <p>
              <strong>Experience:</strong> {doctor.experience} years
            </p>
            <p>
              <strong>Rating:</strong> {doctor.rating}
            </p>
            <p>
              <strong>Bio:</strong> {doctor.bio}
            </p>
            <p>
              <strong>Availability:</strong> {doctor.availability}
            </p>
          </div>

          <div>
            <label className="space-y-2 text-sm" htmlFor="message">
              Send Subscribe Request:{' '}
            </label>
            <br />
            <textarea
              id="message"
              rows={5}
              className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Enter your message here..."
            ></textarea>
            <p className="space-y-2 text-sm">
              By sending this subscription request you are agreeing to sharing
              your personal and medical details with the doctor and affiliated
              services{' '}
            </p>
          </div>
          <DialogFooter>
            <Button variant="default" onClick={handleSend}>
              Send
            </Button>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
