'use client';

import { faker } from '@faker-js/faker';
import { ArrowDown, Folder, Menu } from 'react-feather';

const Toolbar = () => (
    <div className='py-4 pl-2 pr-1 font-bold text-gray-500'>Toolbar</div>
);

const Trash = () => (
    <div className='h-full rounded-lg bg-white p-4 shadow-md'>
        <Toolbar />
        <div className='overflow-x-scroll'>
            <table className='w-full divide-y divide-gray-300'>
                <thead className='sticky top-0 z-10 border-separate border-spacing-0 select-none'>
                    <tr>
                        <th
                            scope='col'
                            className='relative w-12 px-6 sm:w-16 sm:px-8'>
                            <label
                                className='sr-only'
                                htmlFor='SelectAllOrNone'>
                                Select All
                            </label>
                            <input
                                type='checkbox'
                                className='text-primary-600 focus:ring-primary-500 absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 sm:left-6'
                                id='SelectAllOrNone'
                            />
                        </th>
                        <th
                            scope='col'
                            className='min-w-[12rem] py-3.5 pr-3 text-left text-sm font-semibold text-gray-900'>
                            <div className='flex cursor-pointer items-center gap-1'>
                                <span>Name</span>
                                <ArrowDown className='h-4' />
                            </div>
                        </th>
                        <th
                            scope='col'
                            className='hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell'>
                            <div className='flex cursor-pointer items-center gap-1'>
                                <span>Modified</span>
                                <ArrowDown className='h-4' />
                            </div>
                        </th>
                        <th
                            scope='col'
                            className='hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell'>
                            <div className='flex cursor-pointer items-center gap-1'>
                                <span>Size</span>
                                <ArrowDown className='h-4' />
                            </div>
                        </th>
                        <th
                            scope='col'
                            className='relative py-3.5 pl-3 pr-4 sm:pr-6'>
                            <span className='sr-only'>Actions</span>
                        </th>
                    </tr>
                </thead>
                <tbody className='divide-y divide-gray-200'>
                    {Array.from({ length: 10 }).map(() => (
                        <tr key={faker.system.commonFileName()}>
                            <td className='relative w-12 px-6 sm:w-16 sm:px-8'>
                                <div className='bg-primary-600 absolute inset-y-0 left-0 w-0.5' />
                                <label className='sr-only' htmlFor='checkbox'>
                                    All
                                </label>
                                <input
                                    className='text-primary-600 focus:ring-primary-500 absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 sm:left-6'
                                    type='checkbox'
                                    id='checkbox'
                                />
                            </td>
                            <td className='flex items-center gap-2 whitespace-nowrap py-4 pr-3 text-gray-900'>
                                <Folder
                                    className='fill-brand-600 text-brand-600'
                                    size={16}
                                />
                                <span className='truncate'>
                                    {faker.system.commonFileName()}
                                </span>
                            </td>
                            <td className='hidden px-3 py-4 text-sm text-gray-500 lg:table-cell'>
                                {faker.date.past().toDateString()}
                            </td>
                            <td className='hidden px-3 py-4 text-sm text-gray-500 lg:table-cell'>
                                2 GB
                            </td>
                            <td className='w-auto cursor-pointer text-sm font-medium sm:pr-6'>
                                <Menu size={16} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

export default Trash;
