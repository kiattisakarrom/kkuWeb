const MyFormInsideModal = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">แบบฟอร์มใน Modal</h2>
      <form>
        <label className="block mb-2">ชื่อ:</label>
        <input className="border p-2 rounded w-full mb-4" type="text" />
        <button className="bg-blue-500 text-white px-4 py-2 rounded">
          บันทึก
        </button>
      </form>
    </div>
  );
};

export default MyFormInsideModal;
