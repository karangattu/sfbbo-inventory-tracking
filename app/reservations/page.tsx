import { getReservations } from "@/actions/inventory";
import CreateReservationForm from "@/components/CreateReservationForm";
import ReservationCard from "@/components/ReservationCard";

export default async function ReservationsPage() {
  const reservations = await getReservations();

  const activeReservations = reservations.filter((r) => r.status === "reserved");
  const returnedReservations = reservations.filter((r) => r.status === "returned");

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Reservations</h1>

      <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Reservation</h2>
        <CreateReservationForm />
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Active Reservations ({activeReservations.length})
          </h2>
          {activeReservations.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <p className="text-gray-500">No active reservations</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeReservations.map((reservation) => (
                <ReservationCard key={reservation.id} reservation={reservation} />
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Returned Items ({returnedReservations.length})
          </h2>
          {returnedReservations.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <p className="text-gray-500">No returned items yet</p>
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
