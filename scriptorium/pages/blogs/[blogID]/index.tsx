import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router'
import Navigation from '@/components/Navigation';

export default function Blog() {

    const router = useRouter();
    const { blogID } = router.query
    const [blog, setBlog] = useState([]);

    const fetchBlog = async () => {
        const response = await fetch(`/api/user/blogs/${blogID}`);
        const data = await response.json();
        setBlog(data);
    };

    useEffect(() => {
        fetchBlog();
    }, []);

    return (
        <div>
            <Navigation></Navigation>
            <div>
            </div>
        </div>
    );
}