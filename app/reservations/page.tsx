import { getReservations } from "@/actions/inventory";
import CreateReservationForm from "@/components/CreateReservationForm";
import ReservationCard from "@/components/ReservationCard";
import ReservationsManager from "@/components/ReservationsManager";

export default async function ReservationsPage() {
  const reservations = await getReservations();

  const activeReservations = reservations.filter((r) => r.status === "reserved");
  const returnedReservations = reservations.filter((r) => r.status === "returned");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title">Reservations</h1>
        <p className="page-subtitle">Create multi-item reservations and process returns individually or in bulk.</p>
      </div>

      <div className="surface-card p-6">
        <h2 className="section-title mb-4">Create New Reservation</h2>
        <CreateReservationForm />
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="section-title mb-4">
            Active Reservations ({activeReservations.length})
          </h2>
          {activeReservations.length === 0 ? (
            <div className="surface-card text-center py-12">
              <p className="text-slate-500">No active reservations</p>
            </div>
          ) : (
            <ReservationsManager initialReservations={activeReservations} />
          )}
        </div>

        <div>
          <h2 className="section-title mb-4">
            Returned Items ({returnedReservations.length})
          </h2>
          {returnedReservations.length === 0 ? (
            <div className="surface-card text-center py-12">
              <p className="text-slate-500">No returned items yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {returnedReservations.map((reservation) => (
                <ReservationCard key={reservation.id} reservation={reservation} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
