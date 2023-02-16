import { Alert } from '@/lib/stores/alert-store';
import {
    CheckIcon,
    ExclamationCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { X } from 'lucide-react';

export function AlertItem({
    alert,
    close,
}: {
    alert: Alert;
    close: () => void;
}) {
    return (
        <div className='flex items-center justify-between overflow-hidden rounded-lg bg-white shadow-lg'>
            <div className='flex items-center gap-3'>
                <div
                    className={clsx(
                        'grid h-12 w-16 place-items-center',
                        alert.type === 'info' && 'bg-blue-200',
                        alert.type === 'warning' && 'bg-yellow-200',
                        alert.type === 'error' && 'bg-red-200',
                        alert.type === 'success' && 'bg-green-200'
                    )}>
                    {alert.type === 'info' && (
                        <InformationCircleIcon
                            className='w-6 text-blue-600'
                            strokeWidth={2}
                        />
                    )}
                    {alert.type === 'warning' && (
                        <ExclamationCircleIcon
                            className='w-6 text-yellow-600'
                            strokeWidth={2}
                        />
                    )}
                    {alert.type === 'error' && (
                        <ExclamationTriangleIcon
                            className='w-6 text-red-600'
                            strokeWidth={2}
                        />
                    )}
                    {alert.type === 'success' && (
                        <CheckIcon
                            className='w-6 text-green-600'
                            strokeWidth={2}
                        />
                    )}
                </div>
                <div className='w-full text-sm font-bold'>{alert.message}</div>
            </div>
            <button
                type='button'
                className='grid h-12 w-12 place-items-center hover:bg-gray-300'
                onClick={close}>
                <X size={24} />
            </button>
        </div>
    );
}

export function AlertItem2({
    alert,
    close,
}: {
    alert: Alert;
    close: () => void;
}) {
    return (
        <div className='flex flex-col justify-center overflow-hidden rounded-lg text-white shadow-lg shadow-gray-700'>
            <header className='flex w-full items-center justify-between bg-gray-700 p-2'>
                <div className='flex items-center gap-2'>
                    {alert.type === 'info' && (
                        <InformationCircleIcon
                            className='w-6 text-blue-600'
                            strokeWidth={2}
                        />
                    )}
                    {alert.type === 'warning' && (
                        <ExclamationCircleIcon
                            className='w-6 text-yellow-600'
                            strokeWidth={2}
                        />
                    )}
                    {alert.type === 'error' && (
                        <ExclamationTriangleIcon
                            className='w-6 text-red-600'
                            strokeWidth={2}
                        />
                    )}
                    {alert.type === 'success' && (
                        <CheckIcon
                            className='w-6 text-green-600'
                            strokeWidth={2}
                        />
                    )}
                    <span className='text-xl font-bold'>Success!</span>
                </div>
                <button type='button' onClick={close}>
                    <X size={24} />
                </button>
            </header>
            <section className='break-words bg-gray-700/75 p-2 px-4 font-medium'>
                {alert.message}
            </section>
        </div>
    );
}
