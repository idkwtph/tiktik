import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { GoVerified } from "react-icons/go";
import { MdOutlineCancel } from "react-icons/md";
import { BsFillPlayFill } from "react-icons/bs";
import { BiFullscreen, BiExitFullscreen } from "react-icons/bi";
import { HiVolumeUp, HiVolumeOff } from "react-icons/hi";
import axios from "axios";

import { BASE_URL } from "../../utils";
import { Video } from "../../types";
import useAuthStore from "../../store/authStore";
import LikeButton from "../../components/LikeButton";
import Comments from "../../components/Comments";

interface IProps {
  postDetails: Video;
}

const Detail = ({ postDetails }: IProps) => {
  const [post, setPost] = useState(postDetails);
  const [playing, setPlaying] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();
  const { userProfile }: any = useAuthStore();
  const [comment, setComment] = useState("");
  const [isPostingComment, setIsPostingComment] = useState(false);

  const video = document.getElementById("video");

  const enterFullscreen = () => {
    video
      ?.requestFullscreen()
      .then(function () {
        setIsFullscreen(true);
      })
      .catch(function (error) {
        console.log(error);
        setIsFullscreen(false);
      });
  };

  const exitFullscreen = () => {
    document
      .exitFullscreen()
      .then(function () {
        setIsFullscreen(false);
      })
      .catch(function (error) {
        setIsFullscreen(true);
        console.log(error);
      });
  };

  document.addEventListener("fullscreenchange", (e) => {
    if (document.fullscreenElement) {
      // fullscreen
      setIsFullscreen(true);
    } else {
      // exit fullscreen
      setIsFullscreen(false);
    }
  });

  const fullScreenClass =
    "flex justify-center w-full absolute left-0 top-0 bg-black flex-wrap lg:flex-nowrap";

  const onVideoClick = () => {
    if (playing) {
      videoRef?.current?.pause();
      setPlaying(false);
    } else {
      videoRef?.current?.play();
      setPlaying(true);
    }
  };

  useEffect(() => {
    if (post && videoRef?.current) {
      videoRef.current.muted = isVideoMuted;
    }
  }, [post, isVideoMuted]);

  const handleLike = async (like: boolean) => {
    const { data } = await axios.put(`${BASE_URL}/api/like`, {
      userId: userProfile._id,
      postId: post._id,
      like,
    });

    setPost({ ...post, likes: data.likes });
  };

  const addComment = async (e: any) => {
    e.preventDefault();

    if (userProfile && comment) {
      setIsPostingComment(true);

      const { data } = await axios.put(`${BASE_URL}/api/post/${post._id}`, {
        userId: userProfile._id,
        comment,
      });

      setPost({ ...post, comments: data.comments });
      setComment("");
      setIsPostingComment(false);
    }
  };

  if (!post) return null;

  return (
    <div
      className={
        isFullscreen
          ? fullScreenClass
          : `flex w-full absolute left-0 top-0 bg-white flex-wrap lg:flex-nowrap`
      }
    >
      <div
        className={`relative flex-2 w-[1000px] lg:w-full flex justify-center items-center bg-black bg-no-repeat bg-cover bg-center`}
      >
        <div className="opacity-90 absolute top-6 left-2 lg:left-6 flex gap-6 z-50 mix-blend-difference">
          <p className="cursor-pointer" onClick={() => router.back()}>
            <MdOutlineCancel className="text-white text-[35px]" />
          </p>
        </div>
        <div className="relative">
          <div className="lg:h-[100vh] h-[60vh]">
            <video
              id="video"
              ref={videoRef}
              loop
              onClick={onVideoClick}
              src={post.video.asset.url}
              className={
                isFullscreen
                  ? `max-w-[100vw] h-full cursor-pointer`
                  : `h-full cursor-pointer`
              }
            ></video>
          </div>
          <div className="absolute top-[45%] left-[45%] cursor-pointer">
            {!playing && (
              <button
                onClick={onVideoClick}
                className="p-3 rounded-full bg-black opacity-60"
              >
                <BsFillPlayFill className="text-white text-6xl lg:text-8xl" />
              </button>
            )}
          </div>
        </div>

        {/* Fullscreen */}
        <div className="absolute bottom-5 lg:bottom-5 left-5 lg:left-8 cursor-pointer">
          {isFullscreen ? (
            <button onClick={() => exitFullscreen()}>
              <BiExitFullscreen className="text-white text-5xl lg:text:4xl cursor-pointer mix-blend-difference" />
            </button>
          ) : (
            <button onClick={() => enterFullscreen()}>
              <BiFullscreen className="text-white text-5xl lg:text:4xl cursor-pointer mix-blend-difference" />
            </button>
          )}
        </div>

        <div className="absolute bottom-5 lg:bottom-5 right-5 lg:right-8 cursor-pointer">
          {isVideoMuted ? (
            <button onClick={() => setIsVideoMuted(false)}>
              <HiVolumeOff className="text-white text-5xl lg:text:4xl cursor-pointer mix-blend-difference" />
            </button>
          ) : (
            <button onClick={() => setIsVideoMuted(true)}>
              <HiVolumeUp className="text-white text-5xl lg:text:4xl cursor-pointer mix-blend-difference" />
            </button>
          )}
        </div>
      </div>

      {!isFullscreen && (
        <div className="relative w-[1000px] md:w-[900px] lg:w-[700px]">
          <div className="lg:mt-20 mt-10">
            <div className="flex gap-3 p-2 cursor-pointer font-semibold rounded">
              <div className="ml-4 md:w-20 md:h-20 w-16 h-16">
                <Link href="/">
                  <>
                    <Image
                      width={62}
                      height={62}
                      className="rounded-full"
                      src={post.postedBy.image}
                      alt="profile photo"
                      layout="responsive"
                    />
                  </>
                </Link>
              </div>
              <div>
                <Link href="/">
                  <div className="mt-3 flex flex-col gap-2">
                    <p className="flex gap-2 items-center md:text-md font-bold text-primary">
                      {post.postedBy.userName}
                      <GoVerified className="text-blue-400 text-md" />
                    </p>
                    <p className="font-medium text-xs text-gray-500 hidden md:block">
                      {post.postedBy.userName}
                    </p>
                  </div>
                </Link>
              </div>
            </div>

            <p className="px-10 text-lg text-gray-600">{post.caption}</p>

            <div className="px-10">
              {userProfile && (
                <LikeButton
                  likes={post.likes}
                  handleLike={() => handleLike(true)}
                  handleDislike={() => handleLike(false)}
                />
              )}
            </div>
            <Comments
              comment={comment}
              setComment={setComment}
              addComment={addComment}
              comments={post.comments}
              isPostingComment={isPostingComment}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export const getServerSideProps = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const { data } = await axios.get(`${BASE_URL}/api/post/${id}`);

  return {
    props: { postDetails: data },
  };
};

export default Detail;
