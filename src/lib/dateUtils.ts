import { 
  addMinutes, 
  format, 
  isAfter, 
  isBefore, 
  parse, 
  setHours, 
  setMinutes, 
  startOfToday 
} from "date-fns";

export function generateTimeSlots(date: Date, operatingHours: string = "08:00 - 20:00") {
  const [start, end] = operatingHours.split(" - ");
  const startTime = parse(start, "HH:mm", date);
  const endTime = parse(end, "HH:mm", date);
  
  const slots = [];
  let current = startTime;
  
  // Prep time: 30 mins from now if date is today
  const minTime = isAfter(date, startOfToday()) 
    ? date 
    : addMinutes(new Date(), 30);

  while (isBefore(current, endTime)) {
    if (isAfter(current, minTime)) {
      slots.push(format(current, "HH:mm"));
    }
    current = addMinutes(current, 30);
  }
  
  return slots;
}
