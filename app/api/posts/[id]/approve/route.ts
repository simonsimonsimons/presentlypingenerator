import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    // In production, you would:
    // 1. Verify user has reviewer/admin role
    // 2. Get post from database
    // 3. Update status to "freigegeben"
    // 4. Add approval log entry
    // 5. Send notification to content creator

    const approvalData = {
      postId: id,
      approvedBy: "reviewer1", // Get from auth session
      approvedAt: new Date().toISOString(),
      comment: body.comment || "",
      status: "freigegeben",
    }

    return NextResponse.json({
      success: true,
      approval: approvalData,
      message: "Post erfolgreich freigegeben",
    })
  } catch (error) {
    console.error("Error approving post:", error)
    return NextResponse.json({ error: "Fehler bei der Freigabe" }, { status: 500 })
  }
}
