import { Bell } from 'lucide-react';
import { Button } from '../ui/button';

function NotificationButton() {
  return (
    <Button variant="outline" size="icon">
      <Bell />
    </Button>
  );
}

export default NotificationButton;
