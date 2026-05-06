import { Undo } from 'lucide-react';
import { Button } from '../ui/button';

function NavigateBack() {
  return (
    <div>
      <Button
        onClick={() => history.back()}
        size="icon"
        className="dark:bg-gray-400 dark:hover:bg-gray-500 hover:bg-gray-200 bg-gray-300 text-black fixed top-2 left-2 z-50"
        //
      >
        <Undo />
      </Button>
    </div>
  );
}

export default NavigateBack;
