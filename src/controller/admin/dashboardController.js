
const getTotalCounts = async (req, res) => {
    try {
        // get user profile.
        const result = await getUserById(id);
        if(result) {
            return successResponse(res, false, "User Profile.", result)
        }

    } catch (error) {
        return badRequestResponse(res, false, "Something went wrong.", error)
    }
}

const getSubscriptionGraphDetails = async (req, res) => {
    try {
        // get user profile.
        const result = await getUserById(id);
        if(result) {
            return successResponse(res, false, "User Profile.", result)
        }

    } catch (error) {
        return badRequestResponse(res, false, "Something went wrong.", error)
    }
}

