import { Badge } from "../../../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";

interface DashboardMetricCardProps {
  description: string;
  value: string | number;
  label: string;
}

export const DashboardMetricCard = ({ description, value, label }: DashboardMetricCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{description}</CardDescription>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <Badge variant="secondary">{label}</Badge>
      </CardContent>
    </Card>
  );
};
