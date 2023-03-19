type User = {

    /**
     * User id as defined by the database
     */
    id: number,
    /**
     * User's email as entered when created
     */
    email: string

    /**
     * User's first name
     */
    first_name: string

    /**
     * User's Last name
     */
    last_name: string

    /**
     * User's image filename
     */
    image_filename: string

    /**
     * User's password
     */
    password: string

    /**
     * User's authorization token
     */
    auth_token: string
}

type Film = {
    /**
     * Id of the film
     */
    id: number

    /**
     * Title of the film
     */
    title: string

    /**
     * Description of the film
     */
    description: string

    /**
     * Release date of the film
     */
    release_date: number

    /**
     * Genreid of the genre of the film
     */
    genre_id: number

    /**
     * Filename of the image of the film
     */
    image_filename: string

    /**
     * Runtime of the film
     */
    runtime: number

    /**
     * Age rating of the film
     */
    age_rating: string

    /**
     * DirectorId of the director of the film
     */
    director_id: number
}

type Genre = {
    /**
     * Id of genre
     */
    id: number

    /**
     * Name of genre
     */
    name: string
}

type FilmReview = {
    /**
     * Id of review
     */
    id: number

    /**
     * Id of the film reviewed
     */
    film_id: number

    /**
     * Id of the reviewer
     */
    user_id: number

    /**
     * Rating given to the film
     */
    rating: number

    /**
     * Review given by reviewer
     */
    review: string

    /**
     * Time when the review is sent
     */
    timestamp: string
}