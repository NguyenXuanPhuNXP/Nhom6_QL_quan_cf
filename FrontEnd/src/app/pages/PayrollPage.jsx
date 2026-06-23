import { useEffect, useState } from 'react';
import { DollarSign, Download } from 'lucide-react';
import { Loading } from '../components/Loading';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { payrollAPI } from '../services/api';
import { toast } from 'sonner';
// PayrollPage.jsx
export const PayrollPage = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchPayrolls();
  }, [selectedMonth, selectedYear]);

  const fetchPayrolls = async () => {
    setIsLoading(true);
    try {
      const data = await payrollAPI.getByMonth(selectedMonth, selectedYear);
      setPayrolls(data);
    } catch (error) {
      toast.error('Lỗi khi tải dữ liệu lương');
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const calculateTotalPayroll = () => {
    return payrolls.reduce((sum, p) => sum + p.total_salary, 0);
  };

  const handleExport = () => {
    toast.success('Chức năng xuất báo cáo đang phát triển');
  };

  if (isLoading) {
    return <Loading />;
  }

  const months = [
    { value: 1, label: 'Tháng 1' },
    { value: 2, label: 'Tháng 2' },
    { value: 3, label: 'Tháng 3' },
    { value: 4, label: 'Tháng 4' },
    { value: 5, label: 'Tháng 5' },
    { value: 6, label: 'Tháng 6' },
    { value: 7, label: 'Tháng 7' },
    { value: 8, label: 'Tháng 8' },
    { value: 9, label: 'Tháng 9' },
    { value: 10, label: 'Tháng 10' },
    { value: 11, label: 'Tháng 11' },
    { value: 12, label: 'Tháng 12' },
  ];

  const years = [2024, 2025, 2026, 2027];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">Bảng lương</h1>
          <p className="text-slate-600 mt-1">Quản lý lương và thưởng phạt nhân viên</p>
        </div>
        <Button onClick={handleExport} className="w-full bg-green-600 hover:bg-green-700 sm:w-auto">
          <Download className="w-4 h-4 mr-2" />
          Xuất báo cáo
        </Button>
      </div>

      {/* Filters and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <label className="text-sm font-medium text-slate-700">Chọn tháng/năm:</label>
              <Select
                value={selectedMonth.toString()}
                onValueChange={(value) => setSelectedMonth(Number(value))}
              >
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value.toString()}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => setSelectedYear(Number(value))}
              >
                <SelectTrigger className="w-full sm:w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Tổng chi lương</p>
                <h3 className="text-2xl font-bold text-[#3b82f6]">
                  {calculateTotalPayroll().toLocaleString('vi-VN')}đ
                </h3>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-[#3b82f6]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payroll Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Bảng lương tháng {selectedMonth}/{selectedYear}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="min-w-[780px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Nhân viên</TableHead>
                  <TableHead>Vị trí</TableHead>
                  <TableHead className="text-right">Tổng giờ</TableHead>
                  <TableHead className="text-right">Lương cơ bản</TableHead>
                  <TableHead className="text-right">Thưởng</TableHead>
                  <TableHead className="text-right">Phạt</TableHead>
                  <TableHead className="text-right">Tổng lương</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrolls.length > 0 ? (
                  payrolls.map((payroll) => {
                    const baseSalary = payroll.employee
                      ? payroll.employee.salary_rate * payroll.total_hours
                      : 0;

                    return (
                      <TableRow key={payroll.payroll_id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-[#3b82f6] text-white">
                                {payroll.employee && getInitials(payroll.employee.full_name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">
                              {payroll.employee?.full_name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{payroll.employee?.position}</TableCell>
                        <TableCell className="text-right font-medium">
                          {payroll.total_hours}h
                        </TableCell>
                        <TableCell className="text-right">
                          {baseSalary.toLocaleString('vi-VN')}đ
                        </TableCell>
                        <TableCell className="text-right text-green-600 font-medium">
                          +{payroll.bonus.toLocaleString('vi-VN')}đ
                        </TableCell>
                        <TableCell className="text-right text-red-600 font-medium">
                          -{payroll.penalty.toLocaleString('vi-VN')}đ
                        </TableCell>
                        <TableCell className="text-right font-bold text-[#3b82f6]">
                          {payroll.total_salary.toLocaleString('vi-VN')}đ
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-slate-500 py-8">
                      Chưa có dữ liệu lương cho tháng này
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Card */}
      {payrolls.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Thống kê tóm tắt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">Số nhân viên</p>
                <p className="text-2xl font-bold text-[#3b82f6]">{payrolls.length}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">Tổng thưởng</p>
                <p className="text-2xl font-bold text-green-600">
                  {payrolls.reduce((sum, p) => sum + p.bonus, 0).toLocaleString('vi-VN')}đ
                </p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">Tổng phạt</p>
                <p className="text-2xl font-bold text-red-600">
                  {payrolls.reduce((sum, p) => sum + p.penalty, 0).toLocaleString('vi-VN')}đ
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">Lương trung bình</p>
                <p className="text-2xl font-bold text-purple-600">
                  {(calculateTotalPayroll() / payrolls.length).toLocaleString('vi-VN')}đ
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
