import { ForwardedRef, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Droplet } from 'lucide-react';
import { DropzoneInputProps } from 'react-dropzone';

export const FullscreenUpload = forwardRef(function FullscreenUpload(
    {
        isDragActive,
        inputProps,
    }: {
        isDragActive: boolean;
        inputProps: DropzoneInputProps;
    },
    ref: ForwardedRef<HTMLInputElement>
) {
    return (
        <>
            <input ref={ref} {...inputProps} />
            {isDragActive && (
                <motion.div
                    initial={{
                        opacity: 0,
                        top: -100,
                    }}
                    animate={{
                        opacity: 1,
                        top: 0,
                    }}
                    transition={{
                        duration: 0.1,
                    }}
                    className='fixed inset-0 z-50 grid place-items-center bg-gray-400/75'>
                    <div className='flex min-w-[24rem] flex-col items-center justify-center gap-4 rounded-xl bg-white p-12 text-gray-100 shadow-xl'>
                        <Droplet size={196} className='text-brand-600' />
                        <div className='text-xl font-bold text-gray-950'>Drop to upload</div>
                    </div>
                </motion.div>
            )}
        </>
    );
});
