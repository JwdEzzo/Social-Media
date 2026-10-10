import { Undo } from "lucide-react";
import { Button } from "../ui/button";

function NavigateBack() {
  return (
    <div>
      <Button
        onClick={() => history.back()}
        size="icon"
        className="fixed top-3 left-3 z-50 rounded-full border border-border bg-background/80 text-foreground shadow-sm backdrop-blur hover:bg-accent"
        //
      >
        <Undo />
      </Button>
    </div>
  );
}

export default NavigateBack;
