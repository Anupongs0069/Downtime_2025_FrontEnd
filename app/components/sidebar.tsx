'use client'

import Link from "next/link";
import { useState, useEffect } from "react";
import axios from "axios";
import config from "@/app/config";
import Swal from "sweetalert2";

export function Sidebar() {
    const [userLevel, setUserLevel] = useState('');

    useEffect(() => {
        fetchUserLevel();
    }, []);

    const fetchUserLevel = async () => {
        try {
            const token = localStorage.getItem(config.tokenKey);
            const response = await axios.get(`${config.apiUrl}/api/user/level`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setUserLevel(response.data);
        } catch (err: any) {
            Swal.fire({
                title: 'error',
                icon: 'error',
                text: err.message
            })
        }
    }

    let menuItems: any[] = [];

    if (userLevel === 'admin') {
        menuItems = [
            { title: 'Dashboard', href: '/backoffice/dashboard', icon: 'fa-solid fa-chart-simple' },
            { title: 'Downtime', href: '/backoffice/downtime', icon: 'fa-solid fa-clock' },
            { title: 'Member', href: '/backoffice/user', icon: 'fa-solid fa-users' },
            { title: 'Repair Record', href: '/backoffice/repair-record', icon: 'fa-solid fa-screwdriver' },
            { title: 'Repair Status', href: '/backoffice/repair-status', icon: 'fa-solid fa-gear' },
            { title: 'Income Report', href: '/backoffice/income-report', icon: 'fa-solid fa-money-bill' },
            { title: 'All Record', href: '/backoffice/record', icon: 'fa-solid fa-list' },
            { title: 'Device', href: '/backoffice/device', icon: 'fa-solid fa-box' },
            { title: 'Company', href: '/backoffice/company', icon: 'fa-solid fa-shop' },
        ];
    } else if (userLevel === 'user') {
        menuItems = [
            { title: 'Repair Record', href: '/backoffice/repair-record', icon: 'fa-solid fa-screwdriver' },
            { title: 'All Record', href: '/backoffice/record', icon: 'fa-solid fa-list' },
        ];
    } else if (userLevel === 'engineer') {
        menuItems = [
            { title: 'Downtime', href: '/backoffice/downtime', icon: 'fa-solid fa-clock' },
            { title: 'Repair Record', href: '/backoffice/repair-record', icon: 'fa-solid fa-screwdriver' },
            { title: 'Repair Status', href: '/backoffice/repair-status', icon: 'fa-solid fa-gear' },
            { title: 'All Record', href: '/backoffice/record', icon: 'fa-solid fa-list' },
        ];
    } else if (userLevel === 'leader') {
        menuItems = [
            { title: 'Downtime', href: '/backoffice/downtime', icon: 'fa-solid fa-clock' },
            { title: 'Repair Record', href: '/backoffice/repair-record', icon: 'fa-solid fa-screwdriver' },
            { title: 'All Record', href: '/backoffice/record', icon: 'fa-solid fa-list' },
        ];
    }

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <i className="fa-solid fa-user text-4xl mr-5"></i>
                <h1 className="text-xl font-bold">Bun Service 2025</h1>
            </div>
            <nav className="sidebar-nav bg-gray-950 p-4 rounded-tl-3xl ml-4">
                <ul>
                    {menuItems.map((item) => (
                        <li key={item.title}>
                            <Link href={item.href} className="sidebar-item">
                                <i className={item.icon + ' mr-2 w-6'}></i>
                                {item.title}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
}