import { Input } from './presentation/components/ui/input';

// Simple test component to verify shadcn/ui Input is working
export function TestShadcnInput() {
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold">shadcn/ui Input Test</h2>
      <Input placeholder="Test shadcn/ui input..." />
      <Input type="email" placeholder="Email input..." />
      <Input disabled placeholder="Disabled input..." />
    </div>
  );
}
