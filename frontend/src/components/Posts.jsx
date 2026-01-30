import React from 'react'
import Post from './Post'
import { useSelector } from 'react-redux';

export default function Posts() {
  const { posts } = useSelector(store => store.post);
  return (
    <div>
      {posts.filter(Boolean).map((post) => (
        <Post key={post._id} post={post} />
      ))}
    </div>
  )
}