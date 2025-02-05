'use client';

import { useState, useEffect } from 'react';
import config from '@/app/config';
import axios from 'axios';
import Swal from 'sweetalert2';
import Chart from 'apexcharts';
import dayjs from 'dayjs';

export default function Page() {
    const [totalRepairRecord, setTotalRepairRecord] = useState(0);
    const [totalRepairRecordNotComplete, setTotalRepairRecordNotComplete] = useState(0);
    const [totalRepairRecordComplete, setTotalRepairRecordComplete] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);
    const [listYear, setListYear] = useState<number[]>([]);
    const [listMonth, setListMonth] = useState([
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ]);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYearChartIncomePerMonth, setSelectedYearChartIncomePerMonth] = useState(new Date().getFullYear());
    const [listIncomePerMonth, setListIncomePerMonth] = useState<number[]>([]);

    useEffect(() => {
        // ปี 5 ปีที่ผ่านมาจนถึงปัจจุบัน
        const currentYear = dayjs().year();
        const currentMonth = dayjs().month();
        const listYear = Array.from({ length: 5 }, (_, i) => currentYear - i);
        setListYear(listYear);
        setSelectedYear(currentYear);
        setSelectedMonth(currentMonth);
        setSelectedYearChartIncomePerMonth(currentYear);

        fetchData();
    }, []);

    const fetchData = async () => {
        await fetchDataIncomePerDay();
        await fetchDataChartIncomePerMonth();
    };

    const fetchDataIncomePerDay = async () => {
        try {
            const params = {
                year: selectedYear,
                month: selectedMonth + 1
            };
            const response = await axios.get(`${config.apiUrl}/api/repairRecord/dashboard`, {
                params: params
            });

            if (response.data) {
                setTotalRepairRecord(response.data.totalRepairRecord || 0);
                setTotalRepairRecordNotComplete(response.data.totalRepairRecordNotComplete || 0);
                setTotalRepairRecordComplete(response.data.totalRepairRecordComplete || 0);
                setTotalAmount(response.data.totalAmount || 0);

                const listIncomePerDays = response.data.listIncomePerDays
                    ? response.data.listIncomePerDays.map((item: any) => item.amount || 0)
                    : [];
                renderChartIncomePerDays(listIncomePerDays);
                renderChartPie(
                    response.data.totalRepairRecordComplete || 0,
                    response.data.totalRepairRecordNotComplete || 0,
                    response.data.totalRepairRecord || 0
                );
            }
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'การดึงข้อมูลล้มเหลว',
                text: error.message
            });
        }
    };

    const renderChartIncomePerDays = (data: number[]) => {
        const chartIncomePerDays = document.getElementById('chartIncomePerDays');
        if (chartIncomePerDays) {
            const options = {
                chart: { type: 'bar', height: 250, background: 'white' },
                series: [{ data: data }],
                xaxis: {
                    categories: Array.from({ length: 31 }, (_, i) => `${i + 1}`)
                },
            };
            const chart = new Chart(chartIncomePerDays, options);
            chart.render();
        }
    };

    const renderChartIncomePerMonth = (data: number[]) => {
        const chartIncomePerMonth = document.getElementById('chartIncomePerMonth');
        if (chartIncomePerMonth) {
            const options = {
                chart: { type: 'bar', height: 300, background: 'white' },
                series: [{ data: data }],
                xaxis: {
                    categories: [
                        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
                        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
                    ]
                },
            };
            const chart = new Chart(chartIncomePerMonth, options);
            chart.render();
        }
    };

    const renderChartPie = (
        totalRepairRecordComplete: number,
        totalRepairRecordNotComplete: number,
        totalRepairRecord: number
    ) => {
        const chartPie = document.getElementById('chartPie');
        if (chartPie) {
            const data = [totalRepairRecordComplete, totalRepairRecordNotComplete, totalRepairRecord];
            const options = {
                chart: { type: 'pie', height: 300, background: 'white' },
                series: data,
                labels: ['งานซ่อมเสร็จ', 'งานกำลังซ่อม', 'งานทั้งหมด'],
            };
            const chart = new Chart(chartPie, options);
            chart.render();
        }
    };

    const fetchDataChartIncomePerMonth = async () => {
        try {
            const params = {
                year: selectedYearChartIncomePerMonth,
            };
            const response = await axios.get(`${config.apiUrl}/api/repairRecord/incomePerMonth`, {
                params: params
            });

            if (response.data) {
                const listIncomePerMonth = response.data.map((item: any) => item.amount || 0);
                setListIncomePerMonth(listIncomePerMonth);
                renderChartIncomePerMonth(listIncomePerMonth);
            }
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'การดึงข้อมูลล้มเหลว',
                text: error.message
            });
        }
    };

    return (
        <>
            <div className="text-2xl font-bold">Dashboard</div>
            <div className="flex mt-5 gap-4">
                <div className="w-1/4 bg-indigo-500 p-4 rounded-lg text-right">
                    <div className="text-xl font-bold">งานซ่อมทั้งหมด</div>
                    <div className="text-4xl font-bold">{totalRepairRecord}</div>
                </div>
                <div className="w-1/4 bg-pink-500 p-4 rounded-lg text-right">
                    <div className="text-xl font-bold">งานซ่อมเสร็จ</div>
                    <div className="text-4xl font-bold">{totalRepairRecordComplete}</div>
                </div>
                <div className="w-1/4 bg-red-600 p-4 rounded-lg text-right">
                    <div className="text-xl font-bold">งานกำลังซ่อม</div>
                    <div className="text-4xl font-bold">{totalRepairRecordNotComplete}</div>
                </div>
                <div className="w-1/4 bg-green-600 p-4 rounded-lg text-right">
                    <div className="text-xl font-bold">รายได้เดือนนี้</div>
                    <div className="text-4xl font-bold">
                        {totalAmount !== null && totalAmount !== undefined ? totalAmount.toLocaleString() : "0"}
                    </div>
                </div>
            </div>

            <div className="text-2xl font-bold mt-5 mb-2">รายได้รายวัน</div>
            <div className="flex mb-3 mt-2 gap-4 items-end">
                <div className="w-[100px]">
                    <div>ปี</div>
                    <select className="form-control" onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
                        {listYear.map((year, index) => (
                            <option key={index} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
                <div className="w-[100px]">
                    <div>เดือน</div>
                    <select className="form-control" onChange={(e) => setSelectedMonth(parseInt(e.target.value))}>
                        {listMonth.map((month, index) => (
                            <option key={index} value={index}>{month}</option>
                        ))}
                    </select>
                </div>
                <div className="w-[200px] ms-1">
                    <button className="btn" style={{ paddingRight: '20px', paddingLeft: '10px' }} onClick={fetchDataIncomePerDay}>
                        <i className="fa-solid fa-magnifying-glass ms-3 pe-3"></i>
                        แสดงข้อมูล
                    </button>
                </div>
            </div>
            <div id="chartIncomePerDays"></div>

            <div className="text-2xl font-bold mt-5 mb-2">รายได้รายเดือน</div>
            <select className="form-control mb-2 mt-2" onChange={(e) => setSelectedYearChartIncomePerMonth(parseInt(e.target.value))}>
                {listYear.map((year, index) => (
                    <option key={index} value={year}>{year}</option>
                ))}
            </select>
            <button className="btn ms-2" style={{ paddingRight: '20px', paddingLeft: '10px' }} onClick={fetchDataChartIncomePerMonth}>
                <i className="fa-solid fa-magnifying-glass ms-3 pe-3"></i>
                แสดงข้อมูล
            </button>

            <div className="flex gap-4">
                <div className="w-2/3">
                    <div id="chartIncomePerMonth"></div>
                </div>
                <div className="w-1/3">
                    <div id="chartPie"></div>
                </div>
            </div>
        </>
    );
}