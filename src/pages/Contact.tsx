import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Check } from 'lucide-react';
import { ContactFormData } from '../types';
export default function Contact() {
 const [formData, setFormData] = useState<ContactFormData>({
 name: '',
 email: '',
 subject: '',
 message: '',
 });
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [submitSuccess, setSubmitSuccess] = useState(false);
 const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
 const { name, value } = e.target;
 setFormData((prev) => ({ ...prev, [name]: value }));
 };
 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setIsSubmitting(true);
 await new Promise((resolve) => setTimeout(resolve, 1500));
 setIsSubmitting(false);
 setSubmitSuccess(true);
 setFormData({ name: '', email: '', subject: '', message: '' });
 setTimeout(() => setSubmitSuccess(false), 5000);
 };
 return (<div className="min-h-screen py-8">
 <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-12">
 <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">联系我</h1>
 <p className="text-gray-400 max-w-2xl mx-auto">
 有任何问题或合作意向？请随时与我联系，我会尽快回复您。
 </p>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 <div className="lg:col-span-2">
 <div className="bg-dark-100 rounded-2xl p-6 sm:p-8">
 {submitSuccess ? (<div className="text-center py-12">
 <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
 <Check className="w-8 h-8 text-green-500"/>
 </div>
 <h3 className="text-xl font-semibold text-white mb-2">发送成功！</h3>
 <p className="text-gray-400">感谢您的留言，我会尽快回复您。</p>
 </div>) : (<form onSubmit={handleSubmit} className="space-y-6">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
 <div>
 <label className="block text-gray-400 text-sm mb-2">姓名 *</label>
 <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full bg-dark-200 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"/>
 </div>
 <div>
 <label className="block text-gray-400 text-sm mb-2">邮箱 *</label>
 <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full bg-dark-200 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"/>
 </div>
 </div>
 <div>
 <label className="block text-gray-400 text-sm mb-2">主题 *</label>
 <select name="subject" value={formData.subject} onChange={handleChange} required className="w-full bg-dark-200 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors">
 <option value="">请选择主题</option>
 <option value="合作咨询">合作咨询</option>
 <option value="项目询价">项目询价</option>
 <option value="技术交流">技术交流</option>
 <option value="其他">其他</option>
 </select>
 </div>
 <div>
 <label className="block text-gray-400 text-sm mb-2">留言内容 *</label>
 <textarea name="message" value={formData.message} onChange={handleChange} required rows={5} className="w-full bg-dark-200 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors resize-none"/>
 </div>
 <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-primary text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
 {isSubmitting ? (<>
 <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
 </svg>
 发送中...
 </>) : (<>
 <Send className="w-5 h-5"/>
 发送留言
 </>)}
 </button>
 </form>)}
 </div>
 </div>

 <div className="space-y-6">
 <div className="bg-dark-100 rounded-2xl p-6">
 <h3 className="text-lg font-semibold text-white mb-4">联系方式</h3>
 <div className="space-y-4">
 <div className="flex items-start gap-4">
 <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
 <Mail className="w-5 h-5 text-primary-400"/>
 </div>
 <div>
 <p className="text-gray-400 text-sm">邮箱</p>
 <p className="text-white">phq_e_mail@163.com</p>
 </div>
 </div>
 <div className="flex items-start gap-4">
 <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
 <Phone className="w-5 h-5 text-primary-400"/>
 </div>
 <div>
 <p className="text-gray-400 text-sm">电话</p>
 <p className="text-white">+86 132 4241 5882</p>
 </div>
 </div>
 <div className="flex items-start gap-4">
 <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
 <MapPin className="w-5 h-5 text-primary-400"/>
 </div>
 <div>
 <p className="text-gray-400 text-sm">地址</p>
 <p className="text-white">深圳市南山区</p>
 </div>
 </div>
 </div>
 </div>

 </div>
 </div>
 </div>
 </div>);
}

