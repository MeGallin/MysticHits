# | Task | Unit Tests (RTL)

1 | Add Toggle Switch (shadcn Switch) in Users table row | Renders only for admins
2 | On toggle, call PATCH /api/admin/users/:id/role with {isAdmin: val} | API fires with correct payload
3 | Optimistically update UI (role badge / toggle state) | Toggle reflects latest state
4 | Toast success or error feedback | Error toast on 403/400

import { Switch } from '@/components/ui/switch';

function AdminToggle({ id, current }) {
const [isAdmin, setIsAdmin] = useState(current);

const handleChange = async (val: boolean) => {
try {
setIsAdmin(val);
await fetch(`/api/admin/users/${id}/role`, {
method: 'PATCH',
headers: {
'Content-Type': 'application/json',
Authorization: `Bearer ${token}`,
},
body: JSON.stringify({ isAdmin: val }),
});
} catch {
toast.error('Failed to update role');
setIsAdmin(!val); // revert on error
}
};

return <Switch checked={isAdmin} onCheckedChange={handleChange} />;
}
