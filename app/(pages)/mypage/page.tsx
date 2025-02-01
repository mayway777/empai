"use client";

import { useEffect, useState,useCallback  } from "react";
import { Button, Modal, Input } from 'antd';
import { 
 ExclamationCircleOutlined, 
 PlusOutlined, 
 DeleteOutlined, 
 EditOutlined,
 UserOutlined,
 BookOutlined,
 FileTextOutlined,
 LogoutOutlined
} from '@ant-design/icons';
import dynamic from 'next/dynamic';

import { User, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/firebase";
import getCurrentUser from "@/lib/firebase/auth_state_listener";
import { MyProfile, LoginForm, Career } from "@/app/components/mypage";
import { Note } from '@/app/types/note';

const BlockNoteEditor = dynamic(() => 
 import('@/app/components/note/Editor').then((mod) => mod.default), 
 { ssr: false }
);

export default function Page() {
   const [control_id, setID] = useState(0);
   const [user, setUser] = useState<User | null>(null);
   const [modal, contextHolder] = Modal.useModal();
   const [notes, setNotes] = useState<Note[]>([]);
   const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
   const [isEditorSaving, setIsEditorSaving] = useState(false);
   const [isNoteLoading, setIsNoteLoading] = useState(false);

   useEffect(() => {
       getCurrentUser().then((user) => {
           setUser(user);
           setID(user ? 0 : 1);
       });
   }, []);

   const confirm = () => {
       modal.confirm({
           title: '알림',
           centered: true,
           icon: <ExclamationCircleOutlined />,
           content: '정말로 로그아웃 하시겠습니까?',
           okText: '로그아웃',
           cancelText: '취소',
           okButtonProps: {
               style: {
                   backgroundColor: 'red',
                   borderColor: 'red',
                   color: 'white',
               }
           },
           onOk: () => {
               handleLogout();
           },
       });
   };

   const handleLogout = async () => {
       try {
           await signOut(auth);
           window.location.reload();
       } catch (error) {
           console.error("Error logging out:", error);
       }
   };

   const loadNotes = useCallback(async () => {
    if (!user) return;
    const token = await user.getIdToken();
    const response = await fetch(`/api/note?uid=${user.uid}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    setNotes(data.notes);
  }, [user]);  // user를 의존성으로 추가
  
  useEffect(() => {
    if (user && control_id === 3) {
      loadNotes();
    }
  }, [user, control_id, loadNotes]);

   const createNewNote = async () => {
       if (!user) return;
       const token = await user.getIdToken();
       await fetch('/api/note', {
           method: 'POST',
           headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${token}`
           },
           body: JSON.stringify({
               uid: user.uid,
               title: `새 노트 ${notes.length + 1}`,
               content: []
           })
       });
       loadNotes();
   };

   const deleteNote = async (noteId: string) => {
       if (!user) return;
       const token = await user.getIdToken();
       await fetch(`/api/note?noteId=${noteId}`, {
           method: 'DELETE',
           headers: { 'Authorization': `Bearer ${token}` }
       });
       loadNotes();
       if (selectedNoteId === noteId) {
           setSelectedNoteId(null);
       }
   };

   const handleDeleteNote = (noteId: string) => {
       Modal.confirm({
           title: '노트 삭제',
           content: '정말로 이 노트를 삭제하시겠습니까?',
           centered: true,
           okText: '삭제',
           cancelText: '취소',
           okButtonProps: {
               danger: true
           },
           onOk: () => deleteNote(noteId)
       });
   };

   const handleNoteSelection = async (noteId: string) => {
       try {
           setIsNoteLoading(true);
           if (selectedNoteId && selectedNoteId !== noteId) {
               await new Promise(resolve => {
                   const checkSaveStatus = setInterval(() => {
                       if (!isEditorSaving) {
                           clearInterval(checkSaveStatus);
                           resolve(true);
                       }
                   }, 100);
               });
           }
           setSelectedNoteId(noteId);
       } finally {
           setIsNoteLoading(false);
       }
   };

   return (
       <div className="flex flex-col min-h-screen">
           <div className="flex flex-grow">
           {user ? (
   <div className="w-65 min-h-screen bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 
                   border-r border-gray-100 shadow-lg backdrop-blur-md">
       <div className="p-10 space-y-10">
           {/* 헤더 섹션 */}
           <div className="space-y-3">
               <h2 className="text-3xl font-bold bg-clip-text text-transparent 
                            bg-gradient-to-r from-gray-800 to-gray-600">
                   마이페이지
               </h2>
               <div className="h-1.5 w-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" />
           </div>

           {/* 메뉴 버튼 그룹 */}
           <div className="space-y-4">
               <Button
                   type="text"
                   className={`w-full flex items-center px-8 py-5 rounded-2xl transition-all duration-300 group
                       ${control_id === 0
                           ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-xl shadow-blue-500/20'
                           : 'text-gray-600 hover:bg-white/90 hover:shadow-lg'}`}
                   onClick={() => setID(0)}
               >
                   <div className="flex items-center gap-4">
                       <div className={`p-3 rounded-xl transition-colors
                           ${control_id === 0 
                               ? 'bg-white/20' 
                               : 'bg-blue-50 group-hover:bg-blue-100'}`}>
                           <UserOutlined className={`text-xl ${control_id === 0 ? 'text-white' : 'text-blue-500'}`} />
                       </div>
                       <span className="text-lg font-medium">내 정보</span>
                   </div>
               </Button>

               <Button
                   type="text"
                   className={`w-full flex items-center px-8 py-5 rounded-2xl transition-all duration-300 group
                       ${control_id === 2
                           ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-xl shadow-blue-500/20'
                           : 'text-gray-600 hover:bg-white/90 hover:shadow-lg'}`}
                   onClick={() => setID(2)}
               >
                   <div className="flex items-center gap-4">
                       <div className={`p-3 rounded-xl transition-colors
                           ${control_id === 2 
                               ? 'bg-white/20' 
                               : 'bg-blue-50 group-hover:bg-blue-100'}`}>
                           <FileTextOutlined className={`text-xl ${control_id === 2 ? 'text-white' : 'text-blue-500'}`} />
                       </div>
                       <span className="text-lg font-medium">이력정보 등록</span>
                   </div>
               </Button>

               <Button
                   type="text"
                   className={`w-full flex items-center px-8 py-5 rounded-2xl transition-all duration-300 group
                       ${control_id === 3
                           ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-xl shadow-blue-500/20'
                           : 'text-gray-600 hover:bg-white/90 hover:shadow-lg'}`}
                   onClick={() => setID(3)}
               >
                   <div className="flex items-center gap-4">
                       <div className={`p-3 rounded-xl transition-colors
                           ${control_id === 3 
                               ? 'bg-white/20' 
                               : 'bg-blue-50 group-hover:bg-blue-100'}`}>
                           <BookOutlined className={`text-xl ${control_id === 3 ? 'text-white' : 'text-blue-500'}`} />
                       </div>
                       <span className="text-lg font-medium">내 취업노트</span>
                   </div>
               </Button>
           </div>

           {/* 로그아웃 버튼 */}
           <div className="pt-6">
               <Button
                   onClick={confirm}
                   className="w-full px-8 py-5 rounded-2xl text-gray-500 hover:text-white 
                            border-2 border-gray-200 hover:border-red-500 hover:bg-red-500 
                            transition-all duration-300 flex items-center justify-center gap-3 group"
               >
                   <LogoutOutlined className="text-xl transition-transform group-hover:rotate-180" />
                   <span className="text-lg">로그아웃</span>
               </Button>
           </div>
       </div>
       {contextHolder}
   </div>
) : null}

                <section className="flex-1 p-8">
                    <div className="max-w-[1200px] mx-auto">
                        {user ? (
                            <>
                                {control_id === 0 && <MyProfile user={user} />}
                                {control_id === 2 && <Career user={user} />}
                                {control_id === 3 && (
                                    <div className="mx-0">
                                        <div className="p-4 bg-blue-50 mb-4 rounded-lg">
                                            <h1 className="text-xl text-blue-700 font-semibold">
                                                나만의 취업노트를 꾸며보세요! ✨
                                            </h1>
                                            <p className="text-blue-600 mt-1">
                                                면접 준비, 자기소개서, 포트폴리오 등 취업 준비에 필요한 모든 것을 기록해보세요.
                                            </p>
                                        </div>
                                        <div className="flex space-x-4 pl-4">
                                            <div className="w-64 bg-white p-4 rounded-lg shadow h-fit">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h3 className="font-semibold">내 노트 목록</h3>
                                                    <Button
                                                        icon={<PlusOutlined />}
                                                        onClick={createNewNote}
                                                        type="primary"
                                                        size="small"
                                                    >
                                                        새 노트
                                                    </Button>
                                                </div>
                                                <div className="space-y-2">
                                                    {notes.map((note) => (
                                                        <div
                                                            key={note._id}
                                                            className={`flex justify-between items-center p-2 rounded cursor-pointer ${
                                                                selectedNoteId === note._id ? 'bg-blue-50' : 'hover:bg-gray-50'
                                                            }`}
                                                        >
                                                            <span
                                                                onClick={() => handleNoteSelection(note._id)}
                                                                className="flex-1"
                                                            >
                                                                {note.title}
                                                            </span>
                                                            <div className="flex gap-1">
                                                                <Button
                                                                    icon={<EditOutlined />}
                                                                    onClick={() => {
                                                                        Modal.confirm({
                                                                            title: '노트 제목 수정',
                                                                            centered: true,
                                                                            content: (
                                                                                <Input
                                                                                    defaultValue={note.title}
                                                                                    onChange={(e) => {
                                                                                        (e.target as any).value = e.target.value;
                                                                                    }}
                                                                                />
                                                                            ),
                                                                            async onOk(close) {
                                                                                const input = document.querySelector('.ant-modal-content input') as HTMLInputElement;
                                                                                const newTitle = input.value;
                                                                                if (newTitle && newTitle !== note.title) {
                                                                                    const token = await user?.getIdToken();
                                                                                    await fetch('/api/note', {
                                                                                        method: 'POST',
                                                                                        headers: {
                                                                                            'Content-Type': 'application/json',
                                                                                            'Authorization': `Bearer ${token}`
                                                                                        },
                                                                                        body: JSON.stringify({
                                                                                            uid: user?.uid,
                                                                                            noteId: note._id,
                                                                                            title: newTitle
                                                                                        })
                                                                                    });
                                                                                    loadNotes();
                                                                                }
                                                                            },
                                                                            okText: '수정',
                                                                            cancelText: '취소'
                                                                        });
                                                                    }}
                                                                    type="text"
                                                                    size="small"
                                                                />
                                                                <Button
                                                                    icon={<DeleteOutlined />}
                                                                    onClick={() => handleDeleteNote(note._id)}
                                                                    type="text"
                                                                    danger
                                                                    size="small"
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                {isNoteLoading ? (
                                                    <div className="flex items-center justify-center h-[500px]">
                                                        <div className="flex flex-col items-center">
                                                            <EditOutlined className="text-5xl text-blue-500 animate-bounce mb-4" />
                                                            <h2 className="text-xl font-semibold text-gray-700">노트 불러오는 중...</h2>
                                                        </div>
                                                    </div>
                                                ) : selectedNoteId ? (
                                                    <BlockNoteEditor 
                                                        noteId={selectedNoteId} 
                                                        onSaveStart={() => setIsEditorSaving(true)}
                                                        onSaveEnd={() => setIsEditorSaving(false)}
                                                    />
                                                ) : (
                                                    <div className="text-center p-8 text-gray-500">
                                                        노트를 선택하거나 새로 만들어주세요
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <LoginForm />
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}